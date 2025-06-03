import React, { useEffect, useState, useMemo } from 'react';
import { getPedidos, getUsuarios, getPedidoDetalles, getProducto, updatePedido } from '../api/datos.api';
import Swal from 'sweetalert2'; // Importar Swal para las alertas

export function AdminHistorialCompras() {
  // Estados para almacenar los datos
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos'); // Estado para el filtro de estado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(10); // Estado para ítems por página
  const [selectedPedidoId, setSelectedPedidoId] = useState(null); // Estado para el ID del pedido seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  const [modalPedidoDetails, setModalPedidoDetails] = useState(null); // Estado para los detalles del pedido en el modal (con info de producto)
  const [isModalLoading, setIsModalLoading] = useState(false); // Estado para indicar si el modal está cargando detalles
  const [editablePedidoData, setEditablePedidoData] = useState(null); // Estado para los datos editables en el modal

  // Obtener datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [pedidosData, usuariosData] = await Promise.all([
          getPedidos(),
          getUsuarios(),
          
        ]);
        
        setPedidos(pedidosData);
        setUsuarios(usuariosData);
        
        
      } catch (err) {
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para obtener el nombre completo del cliente
  const getNombreCliente = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) return 'Cliente no encontrado';
    return `${usuario.nombre_cliente || ''} ${usuario.apellido_cliente || ''}`.trim();
  };

   

  // Filtrar y ordenar pedidos
  const processedPedidos = useMemo(() => {
    return pedidos
      .filter(pedido => {
        const nombreCliente = getNombreCliente(pedido.usuario).toLowerCase();
        const pedidoIdentifier = pedido.id_pedido || pedido.id;
        if (!pedidoIdentifier) {
          console.warn('Pedido sin id_pedido ni id:', pedido);
          return false; // Filtrar pedidos sin identificador válido
        }
        const clienteMatch = nombreCliente.includes(searchTerm.toLowerCase());
        const estadoMatch = filterEstado === 'Todos' || pedido.estado_compra === filterEstado;
        return clienteMatch && estadoMatch; // Aplicar ambos filtros
      })
      .sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra));
  }, [pedidos, usuarios, searchTerm, filterEstado]);

  // Paginación
  const paginatedPedidos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPedidos.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPedidos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedPedidos.length / itemsPerPage);

  // Función para manejar la selección de fila (simple click)
  const handleRowClick = (pedidoId) => {
    setSelectedPedidoId(pedidoId);
  };

  // Función para manejar el doble click en la fila (abre modal)
  const handleRowDoubleClick = (pedidoId) => {
    setSelectedPedidoId(pedidoId);
    setIsModalOpen(true);
  };

  // Función para abrir el modal con el pedido seleccionado actualmente
  const handleEditClick = () => {
    if (selectedPedidoId) {
      setIsModalOpen(true);
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Ningún pedido seleccionado',
        text: 'Por favor, selecciona un pedido de la tabla para editarlo.',
      });
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalPedidoDetails(null); // Limpiar detalles al cerrar
    setEditablePedidoData(null); // Limpiar también los datos editables
    // Opcional: deseleccionar la fila al cerrar el modal
    // setSelectedPedidoId(null);
  };

  // Encontrar el pedido seleccionado para el modal (solo datos básicos)
  const selectedPedidoBasic = useMemo(() => {
    return pedidos.find(pedido => (pedido.id_pedido || pedido.id) === selectedPedidoId);
  }, [pedidos, selectedPedidoId]);

  // Efecto para cargar los detalles completos del pedido cuando se selecciona uno para el modal
  useEffect(() => {
    const fetchDetailedPedido = async () => {
      if (!selectedPedidoId) {
        console.log('Modal useEffect: No selectedPedidoId.');
        setModalPedidoDetails(null);
        setEditablePedidoData(null); // Limpiar también los datos editables
        return;
      }

      setIsModalLoading(true);
      const basicPedido = pedidos.find(p => (p.id_pedido || p.id) === selectedPedidoId);

      if (!basicPedido) {
        console.log('Modal useEffect: Basic pedido not found for ID:', selectedPedidoId);
        setModalPedidoDetails(null);
        setEditablePedidoData(null); // Limpiar también los datos editables
        setIsModalLoading(false);
        return;
      }

      console.log('Modal useEffect: Basic pedido found:', basicPedido);

      const detailedPedido = { ...basicPedido };

      // Usar los detalles tal como vienen si tienen el nombre de producto directo
      if (basicPedido.detalles && basicPedido.detalles.length > 0) {
        console.log('Modal useEffect: Processing details...');
        const updatedDetalles = await Promise.all(basicPedido.detalles.map(async (detalle) => {
          console.log('Modal useEffect: Processing detalle:', detalle);

          // Priorizar el campo producto_nombre si existe
          if (detalle.producto_nombre) {
            console.log('Modal useEffect: Using producto_nombre from detail:', detalle.producto_nombre);
            // Si ya tiene el nombre, no necesitamos cargar el producto completo
            return detalle;
          }

          // Si no tiene producto_nombre, intentar cargar el producto por ID como fallback (menos eficiente)
          if (detalle.producto_id) {
            console.log('Modal useEffect: producto_nombre missing, fetching product with ID:', detalle.producto_id);
            try {
              const producto = await getProducto(detalle.producto_id);
              console.log('Modal useEffect: Product fetched by ID:', producto);
              // Añadir el nombre al detalle si no lo tenía
              return { ...detalle, producto_nombre: producto.nombre || producto.producto_nombre };
            } catch (prodErr) {
              console.error(`Modal useEffect: Error fetching product ${detalle.producto_id}:`, prodErr);
              return { ...detalle, producto_nombre: 'Error al cargar producto' }; // Marcar con error
            }
          } else {
            console.log('Modal useEffect: Detalle has no producto_nombre and no producto_id.');
            return { ...detalle, producto_nombre: 'Sin ID de producto y sin nombre' }; // Marcar si no hay ID ni nombre
          }
        }));
        detailedPedido.detalles = updatedDetalles;
        setModalPedidoDetails(detailedPedido);
        setEditablePedidoData({ ...detailedPedido }); // Inicializar datos editables
        console.log('Modal useEffect: Final detailed pedido:', detailedPedido);
      } else {
        console.log('Modal useEffect: Basic pedido has no details.');
        setModalPedidoDetails(detailedPedido); // Pedido sin detalles, solo mostrar info básica
        setEditablePedidoData({ ...detailedPedido }); // Inicializar datos editables
      }

      setIsModalLoading(false);
    };

    fetchDetailedPedido();
  }, [selectedPedidoId, pedidos, getProducto]);

  // Manejar cambio en campos editables del modal
  const handleEditableInputChange = (e) => {
    const { name, value } = e.target;
    setEditablePedidoData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Manejar el guardado de cambios del pedido
  const handleSaveChanges = async () => {
    if (!selectedPedidoId || !editablePedidoData) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'No hay pedido seleccionado o datos para guardar.',
      });
      return;
    }

    setIsModalLoading(true); // Indicar que se está guardando

    try {
      // Preparar los datos para enviar. Excluir los detalles del producto si updatePedido no los necesita directamente.
      // Si tu backend espera solo los campos editables, puedes filtrar: 
      // const dataToSave = { ...editablePedidoData };
      // delete dataToSave.detalles; // Si detalles no se actualizan directamente en el endpoint de Pedido

      // Por ahora, enviamos todos los datos editables.
      const dataToSave = { ...editablePedidoData };

      // Si el estado se cambia a 'Recibido', actualizar la fecha de entrega a la fecha actual
      if (dataToSave.estado_compra === 'Recibido') {
        const today = new Date();
        // Formato YYYY-MM-DD
        dataToSave.fecha_entrega = today.toISOString().split('T')[0];
        console.log('Estado cambiado a Recibido, actualizando fecha_entrega a:', dataToSave.fecha_entrega);
      }

      const updatedData = await updatePedido(selectedPedidoId, dataToSave);
      console.log('Pedido actualizado en backend:', updatedData);

      // Actualizar el pedido en la lista principal
      setPedidos(prevPedidos => prevPedidos.map(pedido =>
        (pedido.id_pedido || pedido.id) === selectedPedidoId ? updatedData : pedido
      ));

      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'El pedido ha sido actualizado correctamente.',
      });

      handleCloseModal(); // Cerrar el modal tras guardar

    } catch (saveError) {
      console.error('Error saving order changes:', saveError);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: saveError.response?.data?.detail || saveError.message || 'No se pudieron guardar los cambios.',
      });
    } finally {
      setIsModalLoading(false); // Finalizar carga
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger mt-4">
      {error}
      <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );

  // Si no hay pedidos cargados en absoluto, mostrar un mensaje y nada más.
  if (!loading && pedidos.length === 0 && searchTerm === '' && filterEstado === 'Todos') {
    return <div className="text-center mt-4">No hay pedidos registrados.</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Historial Completo de Pedidos</h2>
      
      {/* Controles de búsqueda y filtrado */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre de cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <span className="badge bg-secondary">
            Mostrando {paginatedPedidos.length} de {processedPedidos.length} pedidos
          </span>
          {/* Botón Editar - visible solo si hay pedidos cargados */}
          {pedidos.length > 0 && (
            <button
              className="btn btn-primary ms-3"
              onClick={handleEditClick}
              disabled={!selectedPedidoId} // Deshabilitado si no hay fila seleccionada
            >
              <i className="bi bi-pencil"></i> Editar Pedido
            </button>
          )}
        </div>
      </div>

      {/* Sección de Filtros y Paginación por página */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-4">
          <label htmlFor="filterEstado" className="form-label mb-0 me-2">Filtrar por Estado:</label>
          <select
            className="form-select form-select-sm d-inline-block w-auto"
            id="filterEstado"
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1); // Resetear página al cambiar filtro
            }}
          >
            {['Todos', 'Pagado', 'En Camino', 'Recibido', 'Cancelado'].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="itemsPerPage" className="form-label mb-0 me-2">Pedidos por página:</label>
          <select
            className="form-select form-select-sm d-inline-block w-auto"
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Resetear página al cambiar ítems por página
            }}
          >
            {[5, 10, 20, 50].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 text-end">
          {/* Esta columna puede usarse para otros controles si son necesarios */}
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Compañia</th>           
              <th>Pais</th>
              <th>Ciudad</th>   
              <th>Estado/Departamento</th>              
              <th>Codigo Postal</th>
              <th>Dirección de envío</th>
              <th>Estado</th>
              <th>Fecha Compra</th>
              <th>Fecha Entrega</th>                            
            </tr>
          </thead>
          <tbody>
            {paginatedPedidos.length > 0 ? (
              paginatedPedidos.map(pedido => {                        
                const pedidoIdentifier = pedido.id_pedido || pedido.id;
                const isSelected = pedidoIdentifier === selectedPedidoId;
                
                return (
                  <tr
                    key={pedidoIdentifier} // Usar el identificador único del pedido como clave
                    className={isSelected ? 'table-primary' : ''} // Aplica clase para resaltar
                    onClick={() => handleRowClick(pedidoIdentifier)}
                    onDoubleClick={() => handleRowDoubleClick(pedidoIdentifier)}
                  >
                    <td>{pedido.id_pedido}</td>
                    <td>
                      <strong>{getNombreCliente(pedido.usuario)}</strong>
                      <div className="text-muted small">{pedido.correo || 'Sin correo'}</div>
                      <div className="text-muted small">{pedido.telefono || 'Sin teléfono'}</div>
                    </td>                               
                    <td>{pedido.company}</td>
                    <td>{pedido.pais}</td>
                    <td>{pedido.ciudad}</td>
                    <td>{pedido.estado_pais}</td>                  
                    <td>{pedido.zip}</td>
                    <td>{pedido.direccion || 'No especificada'}</td>                  
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(pedido.estado_compra)}`}>
                        {pedido.estado_compra || 'Desconocido'}
                      </span>
                    </td>
                    <td>{formatDate(pedido.fecha_compra)}</td>
                    <td>{formatDate(pedido.fecha_entrega)}</td>                  
                  </tr>
                );
              })
            ) : (
              !loading && processedPedidos.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center">No se encontraron pedidos con los filtros aplicados.</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </button>
            </li>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : 
                         currentPage >= totalPages - 2 ? totalPages - 4 + i :
                         currentPage - 2 + i;
              return (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal de Edición */}
      <div className={`modal fade ${isModalOpen ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: isModalOpen ? 'rgba(0,0,0,0.5)' : '' }} aria-hidden={!isModalOpen}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Registro de Pedido #{modalPedidoDetails?.id_pedido || modalPedidoDetails?.id}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              {isModalLoading ? (
                <p>Cargando detalles del pedido...</p>
              ) : modalPedidoDetails ? (
                <form>
                  <div className="row mb-3">
                    {/* Columna Izquierda */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Usuario o Correo</label>
                        <input type="text" className="form-control" value={modalPedidoDetails.correo || (modalPedidoDetails.usuario?.email || 'N/A')} disabled />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="text"
                          className="form-control"
                          name="telefono" // Añadir nombre
                          value={editablePedidoData?.telefono || ''} // Usar datos editables
                          onChange={handleEditableInputChange} // Manejar cambio
                        />
                      </div>
                      <div className="mb-3">
                          <label className="form-label">Estado Compra</label>
                          <select
                              className="form-select"
                              name="estado_compra" // Añadir nombre para identificar el campo
                              value={editablePedidoData?.estado_compra || ''} // Usar datos editables
                              onChange={handleEditableInputChange} // Añadir manejador de cambio
                          >
                              {['Pagado', 'En Camino', 'Recibido', 'Cancelado'].map(estado => (
                                  <option key={estado} value={estado}>{estado}</option>
                              ))}
                          </select>
                      </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Dirección</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="direccion" // Añadir nombre
                          value={editablePedidoData?.direccion || ''} // Usar datos editables
                          onChange={handleEditableInputChange} // Manejar cambio
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Descripción Adicional</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="desc_adicional" // Añadir nombre
                          value={editablePedidoData?.desc_adicional || ''} // Usar datos editables
                          onChange={handleEditableInputChange} // Manejar cambio
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Producto (PedidoDetalle) */}
                  <h5>Detalles del Pedido</h5>
                  {modalPedidoDetails.detalles && modalPedidoDetails.detalles.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal Item</th>
                                    <th>ISV Item</th>
                                    <th>Envío Item</th>
                                    <th>Total Item</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modalPedidoDetails.detalles.map(detalle => (
                                    <tr key={detalle.id}>
                                        <td>{detalle.producto_nombre || 'Producto desconocido'}</td>
                                        <td>{detalle.cantidad_prod || 'N/A'}</td>
                                        <td>{detalle.subtotal ? `$${parseFloat(detalle.subtotal).toFixed(2)}` : 'N/A'}</td>
                                        <td>{detalle.isv ? `$${parseFloat(detalle.isv).toFixed(2)}` : 'N/A'}</td>
                                        <td>{detalle.envio ? `$${parseFloat(detalle.envio).toFixed(2)}` : 'N/A'}</td>
                                        <td>{detalle.total ? `$${parseFloat(detalle.total).toFixed(2)}` : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  ) : (
                      <p>No hay detalles de productos para este pedido.</p>
                  )}

                </form>
              ) : (
                <p>No hay datos de pedido para mostrar.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isModalLoading}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={isModalLoading}>
                {isModalLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Fin Modal de Edición */}
    </div>
  );
}

// Función auxiliar para estilizar el estado
function getEstadoBadgeClass(estado) {
  switch (estado?.toLowerCase()) {
    case 'pagado':
      return 'bg-success';
    case 'en camino':
      return 'bg-warning text-dark';
    case 'recibido':
      return 'bg-primary';
    case 'cancelado':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}