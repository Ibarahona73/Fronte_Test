import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, getProductos, updateProductoStock } from '../api/datos.api'; // Importa la función para actualizar el stock
import { Navigation } from '../components/Navigation';
import { useCart } from '../components/CartContext';

export function VisualProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cart } = useCart();
    const [producto, setProducto] = useState(null);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchProducto() {
            try {
                const data = await getProducto(id);
                setProducto(data); // Usa el stock directamente del backend
            } catch (err) {
                console.error('Error fetching producto:', err);
                setError('Error al cargar el producto');
            } finally {
                setLoading(false);
            }
        }

        fetchProducto();
    }, [id]); // Solo depende del ID del producto

    useEffect(() => {
        async function fetchProductosRelacionados() {
            try {
                const productos = await getProductos();
                setProductosRelacionados(productos.slice(0, 5)); // Obtener los primeros 5 productos
            } catch (err) {
                console.error('Error fetching productos relacionados:', err);
            }
        }

        fetchProductosRelacionados();
    }, [id]); // Asegúrate de que las dependencias sean correctas

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const handleCantidadChange = (e) => {
        const value = Math.min(Math.max(1, parseInt(e.target.value, 10)), producto.cantidad_en_stock);
        setCantidad(value);
    };

    const handleAddToCart = async () => {
        if (isSubmitting) return; // Evita múltiples ejecuciones
        setIsSubmitting(true);

        if (cantidad > producto.cantidad_en_stock) {
            alert('No hay suficiente stock disponible.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Reducir el stock en la base de datos
            await updateProductoStock(producto.id, -cantidad);

            // Reducir el stock en el frontend
            setProducto((prevProducto) => ({
                ...prevProducto,
                cantidad_en_stock: prevProducto.cantidad_en_stock - cantidad,
            }));

            // Añadir al carrito
            addToCart(producto, cantidad);

            setShowCartPopup(true);
            setTimeout(() => setShowCartPopup(false), 4000); // Ocultar el popup después de 4 segundos
        } catch (error) {
            console.error('Error al actualizar el stock:', error);
            alert('Hubo un error al actualizar el stock.');
        } finally {
            setIsSubmitting(false); // Restablece el estado
        }
    };

    return (
        <div>
            <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <img
                        src={producto.imagen_base64 ? `data:image/jpeg;base64,${producto.imagen_base64}` : 'https://via.placeholder.com/300'}
                        alt={producto.nombre}
                        style={{ width: '100%', borderRadius: '5px' }}
                    />
                </div>
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
                    <h1>{producto.nombre}</h1>
                    <h2 style={{ color: '#3498db' }}>
                        ${producto.precio ? Number(producto.precio).toFixed(2) : '0.00'}
                    </h2>
                    <p>{producto.descripcion || 'No hay descripción disponible.'}</p>
                    <p><strong>Stock disponible:</strong> {producto.cantidad_en_stock > 0 ? producto.cantidad_en_stock : 'Agotado'}</p>
                    <input
                        type="number"
                        value={cantidad}
                        onChange={handleCantidadChange}
                        min="1"
                        max={producto.cantidad_en_stock}
                        style={{
                            width: '60px',
                            padding: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                        }}
                        disabled={producto.cantidad_en_stock === 0}
                    />
                    <button
                        onClick={handleAddToCart}
                        style={{
                            backgroundColor: producto.cantidad_en_stock > 0 ? '#3498db' : '#ccc',
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: producto.cantidad_en_stock > 0 ? 'pointer' : 'not-allowed',
                        }}
                        disabled={producto.cantidad_en_stock === 0}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>

            {/* Popup del carrito */}
            {showCartPopup && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                }}>
                    <p>Producto añadido al carrito</p>
                    <p>{producto.nombre}</p>
                    <p>Cantidad: {cantidad}</p>
                    <button
                        onClick={() => navigate('/carrito')}
                        style={{
                            backgroundColor: '#3498db',
                            color: '#fff',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Ver Carrito
                    </button>
                </div>
            )}

            {/* Productos relacionados */}
            <div className="mt-5">
                <h3>Productos Relacionados</h3>
                <div className="d-flex gap-3">
                    {productosRelacionados.map((productoRelacionado) => (
                        <div
                            key={productoRelacionado.id}
                            onClick={() => navigate(`/producto/${productoRelacionado.id}`)}
                            style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                marginLeft: '50px',
                                border: '1px solid black',
                            }}
                        >
                            {productoRelacionado.imagen_base64 ? (
                                <img
                                    src={`data:image/jpeg;base64,${productoRelacionado.imagen_base64}`}
                                    alt={productoRelacionado.nombre}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Sin Imagen</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}