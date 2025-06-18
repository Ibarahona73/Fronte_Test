import React, { useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../components/AuthenticationContext';

export function Carrito() {
    const { cart, cartTotal, removeFromCart, updateCartQuantity, loading, refreshCart } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Verificar stock al cargar el carrito
    useEffect(() => {
        const verificarStock = async () => {
            if (cart.length > 0) {
                try {
                    const itemsConStockInvalido = cart.filter(item => 
                        item.cantidad_prod > item.stock_disponible,
                        
                        
                    );
                    if (itemsConStockInvalido.length > 0) {
                        // Actualizar cantidades para cada item con stock inválido
                        for (const item of itemsConStockInvalido) {
                            try {
                                await updateCartQuantity(item.id, item.stock_disponible);
                                
                            } catch (error) {
                                console.error(`Error al actualizar cantidad del producto ${item.producto_nombre}:`, error);
                            }
                        }

                        Swal.fire({
                            icon: 'warning',
                            title: 'Stock actualizado',
                            text: 'Algunos productos han sido actualizados debido a cambios en el stock disponible.',
                        });
                    }
                } catch (error) {
                    console.error('Error al verificar stock:', error);
                }
            }
        };

        verificarStock();
    }, [cart]);

    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
    };

    const handleQuantityChange = async (id, newQuantity) => {
        try {
            console.log('=== INICIO handleQuantityChange ===');
            console.log('Parámetros recibidos:', { id, newQuantity });

            // Encontrar el item en el carrito
            const item = cart.find(item => item.id === id);
            if (!item) {
                throw new Error('Producto no encontrado en el carrito');
            }

            console.log('Item encontrado en carrito:', {
                id: item.id,
                cantidad_actual: item.cantidad_prod,
                stock_disponible: item.stock_disponible
            });

            // Verificar que la nueva cantidad sea válida
            if (newQuantity < 1) {

                //poner swal
                console.log('Cantidad menor a 1, eliminando producto');
                // Si la cantidad es menor a 1, eliminamos el producto
                await handleRemoveFromCart(id);
                return;
            }

            // Verificar stock disponible solo si estamos aumentando la cantidad
            // if (newQuantity > item.cantidad_prod) {
            //     const stockNecesario = newQuantity - item.cantidad_prod;
            //     console.log('New Verificación de stock:', {
            //         newQuantity,
            //         stock_necesario: stockNecesario,
            //         stock_disponible: item.stock_disponible
            //     });

            //     if (stockNecesario > item.stock_disponible) {
            //         Swal.fire({
            //             icon: 'warning',
            //             title: 'Stock insuficiente',
            //             text: `Solo hay ${item.stock_disponible} unidades disponibles.`,
            //             timer: 2000,
            //             showConfirmButton: false
            //         });
            //         return;
            //     }
            // }

            console.log('Llamando a updateCartQuantity');
            // Actualizar la cantidad
            await updateCartQuantity(id, newQuantity);

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Cantidad actualizada',
                text: 'La cantidad ha sido actualizada correctamente',
                timer: 1500,
                showConfirmButton: false
            });

            console.log('=== FIN handleQuantityChange ===');
        } catch (error) {
            console.error('Error en handleQuantityChange:', {
                message: error.message,
                stack: error.stack
            });
            
            // Si el producto ya no está disponible, eliminarlo del carrito
            if (error.message.includes('ya no está disponible')) {
                await handleRemoveFromCart(id);
                Swal.fire({
                    icon: 'warning',
                    title: 'Producto no disponible',
                    text: 'El producto ha sido removido del carrito porque ya no está disponible.',
                    timer: 2000,
                    showConfirmButton: false
                });
                return;
            }

            // Para otros errores
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar la cantidad del producto',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleRemoveFromCart = async (id) => {
        try {
            await removeFromCart(id);
        } catch (error) {
            // El error ya se maneja en removeFromCart, no es necesario hacer nada aquí
            // Solo lo dejamos para mantener la compatibilidad con el código existente
        }
    };

    const handleProceedToCheckout = async () => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Inicio de sesión requerido',
                text: 'Debes iniciar sesión para proceder con el pago',
                confirmButtonText: 'Ir a iniciar sesión'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.setItem('redirectAfterLogin', '/carrito');
                    navigate('/login');
                }
            });
            return;
        }

        // Verificar stock antes de proceder al pago
        const itemsConStockInvalido = cart.filter(item => 
            item.cantidad_prod > item.stock_disponible            
            
        );
        

        if (itemsConStockInvalido.length > 0) {
            // Actualizar cantidades para cada item con stock inválido
            for (const item of itemsConStockInvalido) {
                await updateCartQuantity(item.id, item.stock_disponible);
            }

            await refreshCart(); // Recargar el carrito para obtener los datos actualizados

            Swal.fire({
                icon: 'warning',
                title: 'Stock actualizado',
                text: 'Algunos productos han sido actualizados debido a cambios en el stock disponible. Por favor, revisa tu carrito antes de continuar.',
            });
            return;
        }

        // Verificar si hay productos en el carrito
        if (cart.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Carrito vacío',
                text: 'No puedes proceder al pago con un carrito vacío.',
            });
            return;
        }

        navigate('/infoclient', {
            state: {
                subtotal: cartTotal,
                isv: cartTotal * 0.15,
                total: cartTotal * 1.15,
                resumen: cart.map(item => ({
                    id: item.producto,
                    nombre: item.producto_nombre,
                    cantidad: item.cantidad_prod,
                    precio: Number(item.producto_precio),
                    image: item.producto?.image,
                    descripcion: item.producto?.descripcion || ''
                })),
            }
        });
    };

    if (loading) {
        return <div className="container mt-4">Cargando carrito...</div>;
    }

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
                        {cart.map((item) => (
                            <div key={item.id} className="card mb-3">
                                <div className="row g-0">
                                    <div className="col-md-3">
                                        {console.log('Datos del producto:', item.producto)}
                                        <img
                                            src={item.producto?.image 
                                                ? `data:image/jpeg;base64,${item.producto.image}`
                                                : 'https://via.placeholder.com/150'}
                                            className="img-fluid rounded-start"
                                            alt={item.producto_nombre}
                                            style={{ height: '150px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                console.error('Error al cargar la imagen:', e);
                                                console.log('Datos del item con error:', item);
                                                e.target.src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-9">
                                        <div className="card-body">
                                            <h5 className="card-title">{item.producto_nombre}</h5>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <p className="mb-0">
                                                        <strong>Precio:</strong> ${formatPrice(item.producto_precio)}
                                                    </p>
                                                    <p className="mb-0">
                                                        <strong>Stock del Inventario:</strong> {item.stock_disponible}
                                                        {console.log('Datos del stock disp:', item.stock_disponible)}
                                                    </p>
                                                    <p className="mb-0">
                                                        <strong>Stock disponible para añadir:</strong> {item.stock_Frontend}
                                                    </p>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => handleQuantityChange(item.id, item.cantidad_prod - 1)}
                                                        disabled={item.cantidad_prod <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="mx-3">{item.cantidad_prod}</span>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => handleQuantityChange(item.id, item.cantidad_prod + 1)}
                                                        disabled={item.cantidad_prod >= item.stock_disponible}
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        className="btn btn-danger ms-3"
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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