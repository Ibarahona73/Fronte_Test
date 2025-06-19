import React, { useEffect, useState } from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../components/AuthenticationContext';

export function Carrito() {
    const { cart, cartTotal, removeFromCart, updateCartQuantity, loading, refreshCart } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stockVisibleData, setStockVisibleData] = useState({});

    // Función para obtener el stock visible desde la API
    const fetchStockVisible = async (productoId) => {
        try {
            // Asegurarse de que productoId es un número
            const id = Number(productoId);
            if (isNaN(id)) {
                console.error('ID de producto inválido:', productoId);
                return null;
            }

            const response = await fetch(`https://tiendaonline-backend-yaoo.onrender.com/stockvisible/${id}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching stock for product ${productoId}:`, error);
            return null;
        }
    };

    // Cargar stocks visibles al montar el componente
    useEffect(() => {
        const loadStockData = async () => {
            if (cart.length > 0) {
                try {
                    const stockPromises = cart.map(item => 
                        fetchStockVisible(item.producto?.id || item.producto)
                    );
                    const stockResults = await Promise.all(stockPromises);

                    const stockData = {};
                    cart.forEach((item, index) => {
                        const productId = item.producto?.id || item.producto;
                        stockData[productId] = stockResults[index] !== null ? 
                            stockResults[index] : 
                            item.stock_disponible;
                    });
                    setStockVisibleData(stockData);
                } catch (error) {
                    console.error('Error loading stock data:', error);
                }
            }
        };

        loadStockData();
    }, [cart]);

    // Verificar stock al cargar el carrito
    useEffect(() => {
        const verificarStock = async () => {
            if (cart.length > 0 && Object.keys(stockVisibleData).length > 0) {
                try {
                    const itemsConStockInvalido = cart.filter(item => {
                        const productId = item.producto?.id || item.producto;
                        return item.cantidad_prod > (stockVisibleData[productId] || item.stock_disponible);
                    });

                    if (itemsConStockInvalido.length > 0) {
                        for (const item of itemsConStockInvalido) {
                            const productId = item.producto?.id || item.producto;
                            const stockDisponible = stockVisibleData[productId] || item.stock_disponible;
                            await updateCartQuantity(item.id, stockDisponible);
                        }

                        await refreshCart();
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
    }, [cart, stockVisibleData]);

    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
    };

    const handleQuantityChange = async (id, newQuantity) => {
        try {
            const item = cart.find(item => item.id === id);
            if (!item) {
                throw new Error('Producto no encontrado en el carrito');
            }

            if (newQuantity < 1) {
                await handleRemoveFromCart(id);
                return;
            }

            const productId = item.producto?.id || item.producto;
            const stockDisponible = stockVisibleData[productId] || item.stock_disponible;
            
            if (newQuantity > stockDisponible) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Stock insuficiente',
                    text: `Solo hay ${stockDisponible} unidades disponibles.`,
                    timer: 2000,
                    showConfirmButton: false
                });
                return;
            }

            await updateCartQuantity(id, newQuantity);
            Swal.fire({
                icon: 'success',
                title: 'Cantidad actualizada',
                text: 'La cantidad ha sido actualizada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error en handleQuantityChange:', error);
            
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
            console.error('Error al eliminar del carrito:', error);
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
        const itemsConStockInvalido = cart.filter(item => {
            const productId = item.producto?.id || item.producto;
            return item.cantidad_prod > (stockVisibleData[productId] || item.stock_disponible);
        });

        if (itemsConStockInvalido.length > 0) {
            for (const item of itemsConStockInvalido) {
                const productId = item.producto?.id || item.producto;
                const stockDisponible = stockVisibleData[productId] || item.stock_disponible;
                await updateCartQuantity(item.id, stockDisponible);
            }

            await refreshCart();
            Swal.fire({
                icon: 'warning',
                title: 'Stock actualizado',
                text: 'Algunos productos han sido actualizados debido a cambios en el stock disponible. Por favor, revisa tu carrito antes de continuar.',
            });
            return;
        }

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
                    id: item.producto?.id || item.producto,
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
                        {cart.map((item) => {
                            const productId = item.producto?.id || item.producto;
                            const stockDisponible = stockVisibleData[productId] || item.stock_disponible;
                            
                            return (
                                <div key={item.id} className="card mb-3">
                                    <div className="row g-0">
                                        <div className="col-md-3">
                                            <img
                                                src={item.producto?.image 
                                                    ? `data:image/jpeg;base64,${item.producto.image}`
                                                    : 'https://via.placeholder.com/150'}
                                                className="img-fluid rounded-start"
                                                alt={item.producto_nombre}
                                                style={{ height: '150px', objectFit: 'cover' }}
                                                onError={(e) => {
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
                                                            <strong>Stock disponible:</strong> {stockDisponible}
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
                                                            disabled={item.cantidad_prod >= stockDisponible}
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