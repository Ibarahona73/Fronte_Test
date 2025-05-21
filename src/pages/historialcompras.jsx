import React, { useEffect, useState } from 'react';
import { getPedidos, getProductos } from '../api/datos.api';

function HistorialCompras() {
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para búsqueda
    const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
    const [busqueda, setBusqueda] = useState({
        firstName: usuarioLocal?.firstName || '',
        lastName: usuarioLocal?.lastName || ''
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [pedidosData, productosData] = await Promise.all([
                    getPedidos(),
                    getProductos()
                ]);
                // Diccionario id → nombre
                const productosDict = {};
                productosData.forEach(prod => {
                    productosDict[prod.id] = prod.nombre;
                });
                setPedidos(pedidosData);
                setProductos(productosDict);
            } catch (err) {
                setError('Error al cargar el historial');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filtra los pedidos por nombre y apellido
    const pedidosFiltrados = pedidos.filter(
        pedido =>
            pedido.nombre_cliente?.toLowerCase() === busqueda.firstName.toLowerCase() &&
            pedido.apellido_cliente?.toLowerCase() === busqueda.lastName.toLowerCase()
    );

    if (loading) return <div>Cargando historial...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Función para mostrar el estado con color
    const EstadoPedido = ({ estado }) => {
        let color = '#888';
        let texto = estado;
        if (estado === 'Pagado') { color = 'red'; texto = 'Pagado'; }
        else if (estado === 'En Camino' || estado === 'Pendiente') { color = 'blue'; texto = 'Pendiente'; }
        else if (estado === 'Recibido' || estado === 'Entregado') { color = 'green'; texto = 'Entregado'; }
        return <span style={{ color, fontWeight: 600 }}>{texto}</span>;
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
            <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Historial De Compras</h2>
            {/* Formulario de búsqueda */}
            <form
                style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}
                onSubmit={e => e.preventDefault()}
            >
                <input
                    type="text"
                    placeholder="Nombre"
                    value={busqueda.firstName}
                    onChange={e => setBusqueda({ ...busqueda, firstName: e.target.value })}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={busqueda.lastName}
                    onChange={e => setBusqueda({ ...busqueda, lastName: e.target.value })}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                />
            </form>
            {pedidosFiltrados.length === 0 ? (
                <p>No se encontraron compras para este usuario.</p>
            ) : (
                pedidosFiltrados.map((pedido) => (
                    <div
                        key={pedido.id_pedido}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #bbb',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 18,
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px #eee'
                        }}
                    >
                        {/* Imagen de producto (opcional) */}
                        <div style={{ width: 70, height: 70, background: '#f3f3f3', borderRadius: 8, marginRight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#bbb', fontSize: 32 }}>🛒</span>
                        </div>
                        {/* Info de la orden */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>
                                Orden #{pedido.id_pedido}
                            </div>
                            <div style={{ fontSize: 15, margin: '8px 0' }}>
                                <span>
                                    {pedido.cantidad}x {productos[pedido.producto] || 'Producto'}
                                </span>
                            </div>
                        </div>
                        {/* Precio y estado */}
                        <div style={{ textAlign: 'right', minWidth: 120 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>
                                ${pedido.total ? Number(pedido.total).toFixed(2) : '0.00'}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <EstadoPedido estado={pedido.estado || 'Pagado'} />
                            </div>
                        </div>
                    </div>
                ))
            )}
            <button
                onClick={() => window.history.back()}
                style={{
                    marginTop: 24,
                    padding: '8px 24px',
                    borderRadius: 8,
                    border: '1px solid #333',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                ⬅ Regresar
            </button>
        </div>
    );
}

export default HistorialCompras;