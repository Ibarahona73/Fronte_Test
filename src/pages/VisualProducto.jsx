import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto } from '../api/datos.api';
import { Navigation } from '../components/Navigation';
import { useCart } from '../components/CartContext';


export function VisualProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [showCartPopup, setShowCartPopup] = useState(false);

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

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const handleCantidadChange = (e) => {
        const value = Math.min(Math.max(1, parseInt(e.target.value, 10)), producto.cantidad_en_stock);
        setCantidad(value);
    };

    const handleAddToCart = () => {
        addToCart(producto, cantidad);
        setShowCartPopup(true);
        setTimeout(() => setShowCartPopup(false), 4000); // Ocultar el popup después de 3 segundos
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
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {/* Miniaturas */}
                        {producto.imagenes?.map((img, index) => (
                            <img
                                key={index}
                                src={`data:image/jpeg;base64,${img}`}
                                alt={`Miniatura ${index + 1}`}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    border: '1px solid #ddd',
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1, marginLeft: '50px' }}>
                    <h1>{producto.nombre}</h1>
                    <h2 style={{ color: '#3498db' }}>
                        ${producto.precio ? Number(producto.precio).toFixed(2) : '0.00'}
                    </h2>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Descripción:</strong>
                        <p>{producto.descripcion || 'No hay descripción disponible.'}</p>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Género:</strong>
                        <div>
                            <button
                                disabled
                                style={{
                                    backgroundColor: producto.categoria === 'H' ? '#3498db' : '#ccc',
                                    color: producto.categoria === 'H' ? '#fff' : '#000',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'not-allowed',
                                    marginRight: '10px',
                                }}
                            >
                                Hombre
                            </button>
                            <button
                                disabled
                                style={{
                                    backgroundColor: producto.categoria === 'M' ? '#3498db' : '#ccc',
                                    color: producto.categoria === 'M' ? '#fff' : '#000',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'not-allowed',
                                }}
                            >
                                Mujer
                            </button>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Tamaño:</strong>
                        <p>{producto.tamaño}</p>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Cantidad en stock:</strong>
                        <p>{producto.cantidad_en_stock > 0 ? producto.cantidad_en_stock : 'Agotado'}</p>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Cantidad:</strong>
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
                        />
                    </div>
                    <button
                        onClick={handleAddToCart}
                        style={{
                            backgroundColor: '#3498db',
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Añadir al carrito
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginLeft: '10px',
                            backgroundColor: '#ccc',
                            color: '#000',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Regresar
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
                    <p>Item Añadido al Carrito</p>
                    <p>{producto.nombre}</p>
                    <p>Cant: {cantidad}</p>
                    <button onClick={() => navigate('/carrito')} style={{
                        backgroundColor: '#3498db',
                        color: '#fff',
                        padding: '5px 10px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}>
                        Ver Carrito
                    </button>
                </div>
            )}
        </div>
    );
}