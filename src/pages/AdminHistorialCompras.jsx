import React, { useEffect, useState, useMemo } from 'react';
import { getPedidos, getUsuarios, getPedidoDetalles, getProducto, updatePedido } from '../api/datos.api';
import Swal from 'sweetalert2'; // Importar Swal para las alertas

export function AdminHistorialCompras() {
    // ============ ESTADOS DEL COMPONENTE ============
    const [pedidos, setPedidos] = useState([]); // Almacena todos los pedidos
    const [usuarios, setUsuarios] = useState([]); // Almacena todos los usuarios  
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [error, setError] = useState(null); // Mensajes de error
    
    // Estados para filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const [filterEstado, setFilterEstado] = useState('Todos'); // Filtro por estado
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const [itemsPerPage, setItemsPerPage] = useState(10); // Ítems por página
    
    // Estados para gestión de selección y modal
    const [selectedPedidoId, setSelectedPedidoId] = useState(null); // ID del pedido seleccionado
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla visibilidad del modal
    const [modalPedidoDetails, setModalPedidoDetails] = useState(null); // Detalles para el modal
    const [isModalLoading, setIsModalLoading] = useState(false); // Carga en el modal
    const [editablePedidoData, setEditablePedidoData] = useState(null); // Datos editables
  
    // ============ EFECTOS ============
    // Efecto para cargar datos iniciales
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Carga paralela de pedidos y usuarios
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
  
    // ============ FUNCIONES AUXILIARES ============
    /**
     * Obtiene el nombre completo del cliente basado en el ID de usuario
     * @param {number} usuarioId - ID del usuario
     * @returns {string} Nombre completo del cliente
     */
    const getNombreCliente = (usuarioId) => {
      const usuario = usuarios.find(u => u.id === usuarioId);
      if (!usuario) return 'Cliente no encontrado';
      return `${usuario.nombre_cliente || ''} ${usuario.apellido_cliente || ''}`.trim();
    };
  
    /**
     * Procesa y filtra los pedidos según búsqueda y filtros aplicados
     * @type {Array}
     */
    const processedPedidos = useMemo(() => {
      return pedidos
        .filter(pedido => {
          const nombreCliente = getNombreCliente(pedido.usuario).toLowerCase();
          const pedidoIdentifier = pedido.id_pedido || pedido.id;
          
          if (!pedidoIdentifier) {
            console.warn('Pedido sin identificador válido:', pedido);
            return false;
          }
          
          const clienteMatch = nombreCliente.includes(searchTerm.toLowerCase());
          const estadoMatch = filterEstado === 'Todos' || pedido.estado_compra === filterEstado;
          return clienteMatch && estadoMatch;
        })
        .sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra)); // Ordena por fecha más reciente
    }, [pedidos, usuarios, searchTerm, filterEstado]);
  
    /**
     * Paginación de resultados
     * @type {Array}
     */
    const paginatedPedidos = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return processedPedidos.slice(startIndex, startIndex + itemsPerPage);
    }, [processedPedidos, currentPage, itemsPerPage]);
  
    // Calcula el total de páginas
    const totalPages = Math.ceil(processedPedidos.length / itemsPerPage);
  
    // ============ MANEJO DE SELECCIÓN Y MODAL ============
    /**
     * Maneja la selección simple de un pedido (resalta fila)
     * @param {number} pedidoId - ID del pedido seleccionado
     */
    const handleRowClick = (pedidoId) => {
      setSelectedPedidoId(pedidoId);
    };
  
    /**
     * Maneja el doble click en un pedido (abre modal de edición)
     * @param {number} pedidoId - ID del pedido seleccionado
     */
    const handleRowDoubleClick = (pedidoId) => {
      setSelectedPedidoId(pedidoId);
      setIsModalOpen(true);
    };
  
    /**
     * Abre el modal de edición para el pedido seleccionado
     * Muestra alerta si no hay pedido seleccionado
     */
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
  
    /**
     * Cierra el modal y limpia los estados relacionados
     */
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalPedidoDetails(null);
      setEditablePedidoData(null);
    };
  
    // ============ GESTIÓN DEL MODAL Y EDICIÓN ============
    // Encuentra el pedido seleccionado para mostrar en el modal
    const selectedPedidoBasic = useMemo(() => {
      return pedidos.find(pedido => (pedido.id_pedido || pedido.id) === selectedPedidoId);
    }, [pedidos, selectedPedidoId]);
  
    // Efecto para cargar detalles completos cuando se abre el modal
    useEffect(() => {
      const fetchDetailedPedido = async () => {
        if (!selectedPedidoId) {
          setModalPedidoDetails(null);
          setEditablePedidoData(null);
          return;
        }
  
        setIsModalLoading(true);
        const basicPedido = pedidos.find(p => (p.id_pedido || p.id) === selectedPedidoId);
  
        if (!basicPedido) {
          setModalPedidoDetails(null);
          setEditablePedidoData(null);
          setIsModalLoading(false);
          return;
        }
  
        const detailedPedido = { ...basicPedido };
  
        // Procesa los detalles del pedido (productos)
        if (basicPedido.detalles && basicPedido.detalles.length > 0) {
          const updatedDetalles = await Promise.all(basicPedido.detalles.map(async (detalle) => {
            // Si ya tiene nombre de producto, no necesita cargar más datos
            if (detalle.producto_nombre) {
              return detalle;
            }
  
            // Si no tiene nombre pero tiene ID, carga el producto para obtener el nombre
            if (detalle.producto_id) {
              try {
                const producto = await getProducto(detalle.producto_id);
                return { ...detalle, producto_nombre: producto.nombre || producto.producto_nombre };
              } catch (prodErr) {
                console.error(`Error al cargar producto ${detalle.producto_id}:`, prodErr);
                return { ...detalle, producto_nombre: 'Error al cargar producto' };
              }
            } else {
              return { ...detalle, producto_nombre: 'Sin ID de producto y sin nombre' };
            }
          }));
          detailedPedido.detalles = updatedDetalles;
        }
        
        setModalPedidoDetails(detailedPedido);
        setEditablePedidoData({ ...detailedPedido });
        setIsModalLoading(false);
      };
  
      fetchDetailedPedido();
    }, [selectedPedidoId, pedidos]);
  
    /**
     * Maneja cambios en los campos editables del modal
     * @param {Object} e - Evento del input
     */
    const handleEditableInputChange = (e) => {
      const { name, value } = e.target;
      setEditablePedidoData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };
  
    /**
     * Guarda los cambios del pedido en el backend
     */
    const handleSaveChanges = async () => {
      if (!selectedPedidoId || !editablePedidoData) {
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: 'No hay pedido seleccionado o datos para guardar.',
        });
        return;
      }
  
      setIsModalLoading(true);
  
      try {
        const dataToSave = { ...editablePedidoData };
  
        // Si el estado cambia a "Recibido", actualiza la fecha de entrega
        if (dataToSave.estado_compra === 'Recibido') {
          const today = new Date();
          dataToSave.fecha_entrega = today.toISOString().split('T')[0];
        }
  
        const updatedData = await updatePedido(selectedPedidoId, dataToSave);
        
        // Actualiza la lista de pedidos
        setPedidos(prevPedidos => prevPedidos.map(pedido =>
          (pedido.id_pedido || pedido.id) === selectedPedidoId ? updatedData : pedido
        ));
  
        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El pedido ha sido actualizado correctamente.',
        });
  
        handleCloseModal();
      } catch (saveError) {
        console.error('Error saving order changes:', saveError);
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: saveError.response?.data?.detail || saveError.message || 'No se pudieron guardar los cambios.',
        });
      } finally {
        setIsModalLoading(false);
      }
    };
  
    // ============ RENDERIZADO CONDICIONAL ============
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
  
    // Si no hay pedidos
    if (!loading && pedidos.length === 0 && searchTerm === '' && filterEstado === 'Todos') {
      return <div className="text-center mt-4">No hay pedidos registrados.</div>;
    }
  
    // ============ RENDERIZADO PRINCIPAL ============
    return (
      <div className="container-fluid mt-4">
        <h2 className="mb-4">Historial Completo de Pedidos</h2>
        
        {/* Controles de búsqueda y acciones */}
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
            {pedidos.length > 0 && (
              <button
                className="btn btn-primary ms-3"
                onClick={handleEditClick}
                disabled={!selectedPedidoId}
              >
                <i className="bi bi-pencil"></i> Editar Pedido
              </button>
            )}
          </div>
        </div>
  
        {/* Filtros y paginación */}
        <div className="row mb-3 align-items-center">
          <div className="col-md-4">
            <label htmlFor="filterEstado" className="form-label mb-0 me-2">Filtrar por Estado:</label>
            <select
              className="form-select form-select-sm d-inline-block w-auto"
              id="filterEstado"
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value);
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 text-end">
            {/* Espacio para otros controles */}
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
                      key={pedidoIdentifier}
                      className={isSelected ? 'table-primary' : ''}
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
                            name="telefono"
                            value={editablePedidoData?.telefono || ''}
                            onChange={handleEditableInputChange}
                          />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Estado Compra</label>
                            <select
                                className="form-select"
                                name="estado_compra"
                                value={editablePedidoData?.estado_compra || ''}
                                onChange={handleEditableInputChange}
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
                            name="direccion"
                            value={editablePedidoData?.direccion || ''}
                            onChange={handleEditableInputChange}
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Descripción Adicional</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="desc_adicional"
                            value={editablePedidoData?.desc_adicional || ''}
                            onChange={handleEditableInputChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
  
                    {/* Detalles del Producto */}
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
      </div>
    );
  }
  
  // ============ FUNCIONES DE UTILIDAD ============
  /**
   * Devuelve la clase CSS para el badge según el estado del pedido
   * @param {string} estado - Estado del pedido
   * @returns {string} Clase CSS para el badge
   */
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
  
  /**
   * Formatea una fecha para mostrarla de manera legible
   * @param {string} dateString - Fecha en formato string
   * @returns {string} Fecha formateada
   */
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }