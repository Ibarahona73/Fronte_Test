import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthenticationContext'; // Importar el contexto de autenticación
import { getPedidos } from '../api/datos.api'; // Importar la función para obtener pedidos
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap si aún no está en tu proyecto

export function HistorialCompras() {
    const { user } = useAuth(); // Obtener el usuario del contexto de autenticación
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Todos'); // Estado para el filtro

    // Opciones de estado para el filtro
    const statusOptions = ['Todos', 'Pagado', 'En Camino', 'Entregado', 'Cancelado'];

    useEffect(() => {
        async function fetchPedidos() {
            if (!user) {
                setLoading(false);
                setError('Usuario no autenticado.');
                return;
            }

            try {
                setLoading(true);
                // Obtener todos los pedidos (idealmente, el backend debería filtrar por usuario)
                const allPedidos = await getPedidos();

                // Filtrar por el usuario logueado
                const userPedidos = allPedidos.filter(pedido => pedido.usuario === user.id);

                setPedidos(userPedidos);
            } catch (err) {
                setError('Error al cargar el historial de compras.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPedidos();
    }, [user]); // Recargar pedidos si el usuario cambia

    // Filtrar pedidos basados en el estado seleccionado
    const filteredPedidos = pedidos.filter(pedido => 
        filterStatus === 'Todos' || pedido.estado_compra === filterStatus
    );

    if (loading) {
        return <div className="text-center mt-4">Cargando historial...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    if (pedidos.length === 0) {
        return <div className="text-center mt-4">No tienes pedidos registrados.</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Historial De Compras</h1>
            
            {/* Selector de estado */}
            <div className="mb-3">
                <label htmlFor="statusFilter" className="form-label">Filtrar por Estado:</label>
                <select 
                    id="statusFilter" 
                    className="form-select w-auto"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="list-group">
                {filteredPedidos.map(pedido => (
                    <div key={pedido.id_pedido} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-3 rounded-3 shadow-sm">
                        <div className="d-flex align-items-center">
                            {/* Placeholder para la imagen */}
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#ccc', marginRight: '15px', borderRadius: '8px' }}></div>
                            
                            <div>
                                <h5 className="mb-1">{pedido.es_movimiento_interno === true || pedido.es_movimiento_interno === 1 ? 'Salida de Stock' : `Orden #${pedido.id_pedido}`}</h5>
                                {/* Resumen de productos */}
                                <p className="mb-1">
                                    {/* Mapear los detalles para mostrar la cantidad y nombre del producto */}
                                    {pedido.detalles && pedido.detalles.length > 0 ?
                                        pedido.detalles.map((detalle, index) => (
                                            <span key={detalle.id}>
                                                {`${detalle.cantidad_prod}x ${detalle.producto_nombre}`}
                                                {index < pedido.detalles.length - 1 ? ', ' : ''}
                                            </span>
                                        )) :
                                        'Detalles no disponibles'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-end">
                            {/* Precio total (usando total_pedido si tu serializer lo incluye) */}
                            {/* Si total_pedido no está disponible, puedes calcularlo sumando los totales de los detalles */}
                            <p className="mb-1">${pedido.total_pedido ? parseFloat(pedido.total_pedido).toFixed(2) : 'N/A'}</p>
                            {/* Estado del pedido con color */}
                            {/* Ajustar el color según el estado real que venga del backend */}
                            <span className={`badge bg-${
                                pedido.estado_compra === 'Pagado' ? 'success' :
                                pedido.estado_compra === 'En Camino' ? 'primary' :
                                pedido.estado_compra === 'Recibido' ? 'info' :
                                pedido.estado_compra === 'Entregado' ? 'success' :
                                pedido.estado_compra === 'Cancelado' ? 'danger' : 'secondary'
                            }`}>
                                {pedido.estado_compra}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón Regresar */}
            <div className="mt-4">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left"></i> Regresar
                </button>
            </div>

        </div>
    );
}
