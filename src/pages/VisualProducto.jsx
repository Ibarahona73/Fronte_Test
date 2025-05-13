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
        if (cantidad > producto.cantidad_en_stock) {
            alert('No hay suficiente stock disponible.');
            return;
        }

        addToCart(producto, cantidad);
        setShowCartPopup(true);
        setTimeout(() => setShowCartPopup(false), 4000); // Ocultar el popup después de 4 segundos
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
        </div>
    );
}