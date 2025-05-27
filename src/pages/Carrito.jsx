import React from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import { updateProductoStock, addProductoStock } from '../api/datos.api'; // Importa las funciones para actualizar el stock
import Swal from 'sweetalert2';
import { useAuth } from '../components/AuthenticationContext';

export function Carrito() {
    // Obtiene el carrito, total, funciones y stock del contexto
    const { cart, cartTotal, removeFromCart, updateCartQuantity, stock } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();

    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
    };

    // Maneja el cambio de cantidad de un producto en el carrito
    const handleQuantityChange = async (id, newQuantity, oldQuantity) => {
        try {
            const currentItem = cart.find(item => item.id === id);
            if (!currentItem) return;

            const availableStock = stock[id] || currentItem.cantidad_en_stock;
            
            // Validar la nueva cantidad
            if (newQuantity < 1 || newQuantity > availableStock) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad no válida',
                    text: `La cantidad debe estar entre 1 y ${availableStock}`,
                });
                return;
            }

            const difference = newQuantity - oldQuantity;

            if (difference > 0) {
                // Si se aumenta la cantidad, reduce el stock en la base de datos
                await updateProductoStock(id, -difference);
            } else if (difference < 0) {
                // Si se reduce la cantidad, aumenta el stock en la base de datos
                await addProductoStock(id, Math.abs(difference));
            }

            // Actualiza la cantidad en el carrito
            await updateCartQuantity(id, newQuantity);
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la cantidad. Por favor intenta nuevamente.',
            });
        }
    };

    // Maneja la eliminación de un producto del carrito
    const handleRemoveFromCart = async (id, quantity) => {
        try {
            // Restaura el stock en la base de datos
            await addProductoStock(id, quantity);

            // Elimina el producto del carrito
            removeFromCart(id);
        } catch (error) {
            // Muestra error si falla la restauración
            console.error('Error al restablecer el stock del producto:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al restablecer el stock del producto.',
            });
        }
    };

    const handleProceedToCheckout = () => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Inicio de sesión requerido',
                text: 'Debes iniciar sesión para proceder con el pago',
                confirmButtonText: 'Ir a iniciar sesión'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Guarda la ruta actual en localStorage para redirigir después del login
                    localStorage.setItem('redirectAfterLogin', '/carrito');
                    navigate('/login');
                }
            });
            return;
        }

        const productsWithInvalidPrice = cart.filter(item => {
            const price = Number(item.precio);
            return isNaN(price) || price <= 0;
        });

        if (productsWithInvalidPrice.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Algunos productos tienen precios inválidos.',
            });
            return;
        }

        navigate('/infoclient', {
            state: {
                subtotal: cartTotal,
                isv: cartTotal * 0.15,
                total: cartTotal * 1.15,
                resumen: cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    cantidad: item.quantity,
                    precio: Number(item.precio),
                    image: item.image
                })),
            }
        });
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Carrito de Compras</h1>
            
            {cart.length === 0 ? (
                <div className="alert alert-info">
                    Tu carrito está vacío
                    <button 
                        className="btn btn-primary ms-3"
                        onClick={() => navigate('/')}
                    >
                        Ir a Productos
                    </button>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-8">
                        {cart.map((item, index) => {
                            const availableStock = stock[item.id] || item.cantidad_en_stock;
                            
                            return (
                                <div key={index} className="card mb-3">
                                    <div className="row g-0">
                                        <div className="col-md-3">
                                            <img
                                                src={item.image
                                                    ? `data:image/jpeg;base64,${item.image}`
                                                    : 'https://via.placeholder.com/150'}
                                                className="img-fluid rounded-start"
                                                alt={item.nombre}
                                                style={{ height: '150px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-md-9">
                                            <div className="card-body">
                                                <h5 className="card-title">{item.nombre}</h5>
                                                <p className="card-text text-muted">
                                                    {item.descripcion || 'Sin descripción'}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <p className="mb-0">
                                                            <strong>Precio:</strong> ${formatPrice(item.precio)}
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Stock disponible:</strong> {availableStock}
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.quantity)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="mx-3">{item.quantity}</span>
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(
                                                                item.id,
                                                                Math.min(item.quantity + 1, availableStock),
                                                                item.quantity
                                                            )}
                                                            disabled={item.quantity >= availableStock}
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            className="btn btn-danger ms-3"
                                                            onClick={() => handleRemoveFromCart(item.id, item.quantity)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Resumen del Pedido</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <strong><span>Subtotal:</span></strong>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <strong><span>Est.ISV:</span></strong>
                                    <span>${(cartTotal * 0.15).toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total:</span>
                                    <span>${(cartTotal * 1.15).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="card-footer bg-white">
                                <button
                                    className="btn btn-primary w-100 mb-2"
                                    onClick={handleProceedToCheckout}
                                    disabled={cart.length === 0}
                                >
                                    Proceder al Pago
                                </button>
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => navigate('/')}
                                >
                                    Seguir Comprando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
