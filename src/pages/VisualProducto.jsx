import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, getProductos } from '../api/datos.api';
import { Navigation } from '../components/Navigation';
import { useCart } from '../components/CartContext';
import Swal from 'sweetalert2';

export function VisualProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
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
                setProducto(data);
            } catch (err) {
                console.error('Error fetching producto:', err);
                setError('Error al cargar el producto');
            } finally {
                setLoading(false);
            }
        }

        fetchProducto();
    }, [id]);

    useEffect(() => {
        async function fetchProductosRelacionados() {
            try {
                const productos = await getProductos();
                setProductosRelacionados(productos.slice(0, 5));
            } catch (err) {
                console.error('Error fetching productos relacionados:', err);
            }
        }

        fetchProductosRelacionados();
    }, [id]);

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const handleCantidadChange = (e) => {
        const value = Math.min(Math.max(1, parseInt(e.target.value, 10)), producto.cantidad_en_stock);
        setCantidad(value);
    };

    const handleAddToCart = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const usuario = localStorage.getItem('usuario');
            
            if (!token || !usuario) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Inicio de sesión requerido',
                    text: 'Debes iniciar sesión para agregar productos al carrito',
                    confirmButtonText: 'Ir a iniciar sesión'
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.setItem('redirectAfterLogin', '/producto/' + id);
                        navigate('/login');
                    }
                });
                return;
            }

            await addToCart(producto, cantidad);
            setShowCartPopup(true);
            setTimeout(() => setShowCartPopup(false), 4000);
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            
            if (error.message.includes('Sesión expirada') || error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                    confirmButtonText: 'Ir a iniciar sesión'
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.setItem('redirectAfterLogin', '/producto/' + id);
                        navigate('/login');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Hubo un error al agregar el producto al carrito.',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <img
                        src={producto.image ? `data:image/jpeg;base64,${producto.image}` : 'https://via.placeholder.com/300'}
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
                            {productoRelacionado.image ? (
                                <img
                                    src={`data:image/jpeg;base64,${productoRelacionado.image}`}
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

