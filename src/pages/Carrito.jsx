import React from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import { updateProductoStock, addProductoStock } from '../api/datos.api'; // Importa las funciones para actualizar el stock

export function Carrito() {
    const { cart, cartTotal, removeFromCart, updateCartQuantity, stock } = useCart();
    const navigate = useNavigate();

    // Función para manejar la actualización del stock al añadir o reducir cantidad
    const handleQuantityChange = async (id, newQuantity, oldQuantity) => {
        try {
            const difference = newQuantity - oldQuantity;

            if (difference > 0) {
                // Si se aumenta la cantidad, reduce el stock en la base de datos
                await updateProductoStock(id, difference);
            } else if (difference < 0) {
                // Si se reduce la cantidad, aumenta el stock en la base de datos
                await addProductoStock(id, Math.abs(difference));
            }

            // Actualiza la cantidad en el carrito
            updateCartQuantity(id, newQuantity);
        } catch (error) {
            console.error('Error al actualizar el stock del producto:', error);
            alert('Hubo un error al actualizar el stock del producto.');
        }
    };

    // Función para manejar la eliminación de un producto del carrito
    const handleRemoveFromCart = async (id, quantity) => {
        try {
            // Restablece el stock en la base de datos
            await addProductoStock(id, quantity);

            // Elimina el producto del carrito
            removeFromCart(id);
        } catch (error) {
            console.error('Error al restablecer el stock del producto:', error);
            alert('Hubo un error al restablecer el stock del producto.');
        }
    };

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
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <p>Precio: ${item.precio ? Number(item.precio).toFixed(2) : '0.00'}</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.quantity)}
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
                                            handleQuantityChange(
                                                item.id,
                                                Math.min(item.quantity + 1, stock[item.id] || item.cantidad_en_stock),
                                                item.quantity
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
                                    onClick={() => handleRemoveFromCart(item.id, item.quantity)}
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