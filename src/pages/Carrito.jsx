import React from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';

export function Carrito() {
    const { cart, cartTotal, removeFromCart, updateCartQuantity, stock } = useCart();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px' }}>
            <h1>Carrito</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Lista de productos */}
                <div style={{ flex: 2 }}>
                    {cart.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                marginBottom: '20px',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #ddd',
                                paddingBottom: '10px',
                            }}
                        >
                            <img
                                src={item.imagen_base64 ? `data:image/jpeg;base64,${item.imagen_base64}` : 'https://via.placeholder.com/100'}
                                alt={item.nombre}
                                style={{ width: '200px', height: '100px', marginRight: '20px' }}
                            />
                            <div style={{ flex: 2 }}>
                                <h3>{item.nombre}</h3>
                                <p>{item.descripcion || 'No hay descripción disponible.'}</p>
                                <p>Stock disponible: {stock[item.id] || item.cantidad_en_stock}</p>
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <p>Precio: ${item.precio ? Number(item.precio).toFixed(2) : '0.00'}</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <button
                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        style={{
                                            backgroundColor: item.quantity > 1 ? '#3498db' : '#ccc',
                                            color: '#fff',
                                            padding: '5px 10px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: item.quantity > 1 ? 'pointer' : 'not-allowed',
                                            marginRight: '10px',
                                        }}
                                    >
                                        -
                                    </button>
                                    <p style={{ margin: '0 10px' }}>Cantidad: {item.quantity}</p>
                                    <button
                                        onClick={() =>
                                            updateCartQuantity(
                                                item.id,
                                                Math.min(item.quantity + 1, stock[item.id] || item.cantidad_en_stock)
                                            )
                                        }
                                        disabled={item.quantity >= (stock[item.id] || item.cantidad_en_stock)}
                                        style={{
                                            backgroundColor: item.quantity < (stock[item.id] || item.cantidad_en_stock) ? '#3498db' : '#ccc',
                                            color: '#fff',
                                            padding: '5px 10px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: item.quantity < (stock[item.id] || item.cantidad_en_stock) ? 'pointer' : 'not-allowed',
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    style={{
                                        backgroundColor: '#e74c3c',
                                        color: '#fff',
                                        padding: '5px 10px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        marginTop: '10px',
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumen del carrito */}
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
                    <h3>Resumen</h3>
                    <p>Subtotal: ${cartTotal.toFixed(2)}</p>
                    <p>Envío: $9.00</p>
                    <p>ISV: ${(cartTotal * 0.15).toFixed(2)}</p>
                    <h4>Estimado: ${(cartTotal + 9 + cartTotal * 0.15).toFixed(2)}</h4>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: '#3498db',
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        Proceder a Pagar
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            backgroundColor: '#ccc',
                            color: '#000',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        Regresar
                    </button>
                </div>
            </div>
        </div>
    );
}