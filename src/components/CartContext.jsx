import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCarrito, addToCarrito, updateCarritoItem, removeFromCarrito, verificarCarrito, limpiarCarrito } from '../api/datos.api';
import Swal from 'sweetalert2';
import useStockRealtimeUpdater from '../components/useStockRealtimeUpdater';


// Crear el contexto del carrito
const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar el carrito al iniciar
    useEffect(() => {
        loadCart();
    }, []);

    // Verificar expiración cada vez que se carga el carrito
    useEffect(() => {
        if (cart.length > 0) {
            // Agregar un pequeño delay antes de verificar
            const timer = setTimeout(() => {
                checkcarrito();
            }, 2000); // Esperar 2 segundos antes de verificar

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
    }, [cart]);

    // Callback memoizado para actualizaciones en tiempo real
    const realtimeUpdateCallback = useCallback(() => {
        console.log('CartContext - Recibida actualización en tiempo real, recargando carrito');
        loadCart();
    }, []);

    useStockRealtimeUpdater(realtimeUpdateCallback);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const carritoData = await getCarrito();
            console.log('Carrito cargado:', carritoData);
            
            // Calcular stock_Frontend para cada ítem del carrito
            const updatedCart = carritoData.map(item => ({
                ...item,
                // stock_Frontend representa el stock disponible para añadir más, después de lo que ya está en el carrito
                stock_Frontend: item.stock_disponible - item.cantidad_prod
            }));
            setCart(updatedCart);
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            setError(error.message);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    const checkcarrito = async () => {
        try {
            const { productos_expirados } = await verificarCarrito();
            
            // Solo mostrar alerta si realmente hay productos expirados
            if (productos_expirados && productos_expirados.length > 0) {
                // Verificar si hay productos realmente expirados (no solo ajustados)
                const productosRealmenteExpirados = productos_expirados.filter(
                    producto => producto.motivo === 'expirado_por_tiempo' || producto.motivo === 'sin_stock_o_producto_no_existe'
                );

                if (productosRealmenteExpirados.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Productos expirados',
                        text: 'Algunos productos en tu carrito han expirado o no están disponibles.',
                    });
                }
                
                // Recargar el carrito para actualizar el estado
                await loadCart();
            }
        } catch (error) {
            console.error('Error al verificar expiración:', error);
            // Si hay error, intentar recargar el carrito de todos modos
            await loadCart();
        }
    };

    const addToCart = async (product, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Debes iniciar sesión para agregar productos al carrito');
            }
            
            console.log('Agregando al carrito:', { product: product.id, quantity });
            await addToCarrito(product.id, quantity);
            
            // Recargar el carrito inmediatamente después de agregar
            console.log('Recargando carrito después de agregar producto');
            await loadCart();
            
            // No verificamos expiración inmediatamente después de agregar
            // La verificación se hará en el siguiente ciclo de useEffect
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            if (error.message.includes('Sesión expirada') || error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            throw error;
        }
    };

    const updateCartQuantity = async (id, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Debes iniciar sesión para actualizar el carrito');
            }

            console.log('Actualizando carrito:', {
                id,
                quantity,
                token: token.substring(0, 10) + '...' // Solo mostramos parte del token por seguridad
            });

            const hola = await updateCarritoItem(id, quantity);
            console.log('ese hola',hola)
            
            // Recargar el carrito después de la actualización
            await loadCart(); //reemplazar por una que actualize el contexto

            return true;
        } catch (error) {
            console.error('Error en updateCartQuantity:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            // Propagar el error para que sea manejado por el componente
            throw error;
        }
    };

    const removeFromCart = async (id) => {
        try {
            console.log(`Intentando eliminar ítem ${id} del carrito`);
            
            // Optimistic update
            setCart(prevCart => {
                const item = prevCart.find(item => item.id === id);
                console.log('item de remove',item)
                if (!item) {
                    console.warn(`Ítem ${id} no encontrado en el estado local`);
                    return prevCart;
                }
                return prevCart.filter(item => item.id !== id);
            });
    
            await removeFromCarrito(id);
            
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Producto removido del carrito',
                timer: 1500,
                showConfirmButton: false
            });
    
            // Sincronizar con backend
            await loadCart();
            
        } catch (error) {
            console.error('Error en removeFromCart:', {
                id,
                error: error.message,
                cartState: cart
            });
            
            // Revertir optimistic update si falló
            await loadCart();
            
            let message = 'Error al eliminar el producto';
            if (error.message.includes('Sesión expirada') || error.response?.status === 401) {
                message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            } else if (error.message.includes('no existe')) {
                message = 'El producto ya no está en el carrito';
            }
    
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                timer: 2000
            });
        }
    };

    const clearCart = async () => {
        try {
            await limpiarCarrito();
            setCart([]);
            console.log('Carrito limpiado exitosamente');
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    };

    // Calcular el total del carrito
    const cartTotal = cart.reduce((total, item) => {
        return total + (Number(item.producto_precio) * item.cantidad_prod);
    }, 0);

    // Proveer el contexto a los componentes hijos
    return (
        <CartContext.Provider value={{
            cart,
            loading,
            error,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            cartTotal,
            clearCart,
            refreshCart: loadCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

// Hook personalizado para usar el contexto del carrito
export function useCart() {
    return useContext(CartContext);
} 
