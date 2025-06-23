/**
 * CONTEXTO DEL CARRITO DE COMPRAS
 * 
 * Este archivo maneja toda la lógica relacionada con el carrito de compras de la aplicación.
 * Proporciona un contexto global que permite a cualquier componente:
 * - Agregar productos al carrito
 * - Actualizar cantidades
 * - Eliminar productos
 * - Verificar expiración de productos
 * - Sincronizar con el backend en tiempo real
 * 
 * Funcionalidades principales:
 * - Gestión de estado del carrito
 * - Comunicación con la API del backend
 * - Verificación automática de productos expirados
 * - Actualizaciones en tiempo real del stock
 * - Manejo de errores y sesiones expiradas
 */

// Importaciones de React para el contexto y hooks
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Importaciones de funciones de la API para operaciones del carrito
import { getCarrito, addToCarrito, updateCarritoItem, removeFromCarrito, verificarCarrito, limpiarCarrito } from '../api/datos.api';

// Importaciones de librerías externas
import Swal from 'sweetalert2'; // Para mostrar alertas al usuario
import useStockRealtimeUpdater from '../components/useStockRealtimeUpdater'; // Hook para actualizaciones en tiempo real

// Crear el contexto del carrito
const CartContext = createContext();

/**
 * PROVEEDOR DEL CONTEXTO DEL CARRITO
 * 
 * Este componente proporciona el contexto del carrito a toda la aplicación.
 * Maneja toda la lógica de estado y operaciones del carrito.
 * 
 * @param {Object} children - Los componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} - El proveedor del contexto con toda la funcionalidad
 */
export function CartProvider({ children }) {
    // Estado del carrito - array de productos en el carrito
    const [cart, setCart] = useState([]);
    
    // Estado de carga - indica si se está cargando el carrito
    const [loading, setLoading] = useState(true);
    
    // Estado de error - almacena errores que ocurran durante las operaciones
    const [error, setError] = useState(null);

    /**
     * CARGAR EL CARRITO AL INICIAR LA APLICACIÓN
     * 
     * Este useEffect se ejecuta una sola vez al montar el componente
     * para cargar el carrito desde el backend.
     */
    useEffect(() => {
        loadCart();
    }, []);

    /**
     * VERIFICAR EXPIRACIÓN DE PRODUCTOS EN EL CARRITO
     * 
     * Este useEffect se ejecuta cada vez que cambia el carrito.
     * Verifica si hay productos expirados y muestra alertas al usuario.
     * Incluye un delay de 2 segundos para evitar verificaciones inmediatas.
     */
    useEffect(() => {
        if (cart.length > 0) {
            // Agregar un pequeño delay antes de verificar para evitar verificaciones inmediatas
            const timer = setTimeout(() => {
                checkcarrito();
            }, 2000); // Esperar 2 segundos antes de verificar

            return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
        }
    }, [cart]);

    /**
     * CALLBACK PARA ACTUALIZACIONES EN TIEMPO REAL
     * 
     * Este callback se ejecuta cuando se reciben actualizaciones en tiempo real
     * del stock de productos. Recarga el carrito para mantener la información actualizada.
     */
    const realtimeUpdateCallback = useCallback(() => {
        console.log('CartContext - Recibida actualización en tiempo real, recargando carrito');
        loadCart();
    }, []);

    // Conectar con el sistema de actualizaciones en tiempo real
    useStockRealtimeUpdater(realtimeUpdateCallback);

    /**
     * CARGAR EL CARRITO DESDE EL BACKEND
     * 
     * Esta función obtiene el carrito actual del usuario desde la API
     * y calcula el stock disponible para cada producto.
     */
    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Obtener datos del carrito desde la API
            const carritoData = await getCarrito();
            console.log('Carrito cargado:', carritoData);
            
            // Calcular stock_Frontend para cada ítem del carrito
            // stock_Frontend representa el stock disponible para añadir más, 
            // después de lo que ya está en el carrito
            const updatedCart = carritoData.map(item => ({
                ...item,
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

    /**
     * VERIFICAR PRODUCTOS EXPIRADOS EN EL CARRITO
     * 
     * Esta función verifica si hay productos en el carrito que han expirado
     * o no están disponibles. Muestra alertas al usuario si encuentra problemas.
     */
    const checkcarrito = async () => {
        try {
            // Verificar productos expirados en el backend
            const { productos_expirados } = await verificarCarrito();
            
            // Solo mostrar alerta si realmente hay productos expirados
            if (productos_expirados && productos_expirados.length > 0) {
                // Verificar si hay productos realmente expirados (no solo ajustados)
                const productosRealmenteExpirados = productos_expirados.filter(
                    producto => producto.motivo === 'expirado_por_tiempo' || producto.motivo === 'sin_stock_o_producto_no_existe'
                );

                // Mostrar alerta solo si hay productos realmente problemáticos
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

    /**
     * AGREGAR PRODUCTO AL CARRITO
     * 
     * Esta función agrega un producto al carrito del usuario.
     * Verifica que el usuario esté autenticado antes de proceder.
     * 
     * @param {Object} product - El producto a agregar
     * @param {number} quantity - La cantidad a agregar
     * @throws {Error} - Si el usuario no está autenticado o hay otros errores
     */
    const addToCart = async (product, quantity) => {
        try {
            // Verificar que el usuario esté autenticado
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Debes iniciar sesión para agregar productos al carrito');
            }
            
            console.log('Agregando al carrito:', { product: product.id, quantity });
            
            // Agregar producto al carrito en el backend
            await addToCarrito(product.id, quantity);
            
            // Recargar el carrito inmediatamente después de agregar
            console.log('Recargando carrito después de agregar producto');
            await loadCart();
            
            // No verificamos expiración inmediatamente después de agregar
            // La verificación se hará en el siguiente ciclo de useEffect
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            
            // Manejar errores de autenticación
            if (error.message.includes('Sesión expirada') || error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            throw error;
        }
    };

    /**
     * ACTUALIZAR CANTIDAD DE UN PRODUCTO EN EL CARRITO
     * 
     * Esta función actualiza la cantidad de un producto específico en el carrito.
     * 
     * @param {number} id - ID del ítem del carrito a actualizar
     * @param {number} quantity - Nueva cantidad
     * @returns {boolean} - true si la actualización fue exitosa
     * @throws {Error} - Si hay errores durante la actualización
     */
    const updateCartQuantity = async (id, quantity) => {
        try {
            // Verificar que el usuario esté autenticado
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Debes iniciar sesión para actualizar el carrito');
            }

            console.log('Actualizando carrito:', {
                id,
                quantity,
                token: token.substring(0, 10) + '...' // Solo mostramos parte del token por seguridad
            });

            // Actualizar cantidad en el backend
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

            // Manejar errores de autenticación
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            // Propagar el error para que sea manejado por el componente
            throw error;
        }
    };

    /**
     * ELIMINAR PRODUCTO DEL CARRITO
     * 
     * Esta función elimina un producto específico del carrito.
     * Utiliza actualización optimista para mejorar la experiencia del usuario.
     * 
     * @param {number} id - ID del ítem del carrito a eliminar
     */
    const removeFromCart = async (id) => {
        try {
            console.log(`Intentando eliminar ítem ${id} del carrito`);
            
            // ACTUALIZACIÓN OPTIMISTA: Actualizar el estado inmediatamente
            // para que el usuario vea el cambio instantáneamente
            setCart(prevCart => {
                const item = prevCart.find(item => item.id === id);
                console.log('item de remove',item)
                if (!item) {
                    console.warn(`Ítem ${id} no encontrado en el estado local`);
                    return prevCart;
                }
                return prevCart.filter(item => item.id !== id);
            });
    
            // Eliminar del backend
            await removeFromCarrito(id);
            
            // Mostrar confirmación al usuario
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
            
            // Revertir actualización optimista si falló
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

    /**
     * LIMPIAR TODO EL CARRITO
     * 
     * Esta función elimina todos los productos del carrito.
     * Se usa principalmente después de completar una compra.
     */
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

    /**
     * CALCULAR EL TOTAL DEL CARRITO
     * 
     * Calcula el precio total de todos los productos en el carrito
     * multiplicando el precio de cada producto por su cantidad.
     */
    const cartTotal = cart.reduce((total, item) => {
        return total + (Number(item.producto_precio) * item.cantidad_prod);
    }, 0);

    /**
     * PROVEER EL CONTEXTO A LOS COMPONENTES HIJOS
     * 
     * Retorna el proveedor del contexto con todos los valores y funciones
     * que estarán disponibles para cualquier componente hijo.
     */
    return (
        <CartContext.Provider value={{
            cart,                    // Array de productos en el carrito
            loading,                 // Estado de carga
            error,                   // Estado de error
            addToCart,               // Función para agregar productos
            removeFromCart,          // Función para eliminar productos
            updateCartQuantity,      // Función para actualizar cantidades
            cartTotal,               // Total del carrito
            clearCart,               // Función para limpiar el carrito
            refreshCart: loadCart    // Función para recargar el carrito
        }}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * HOOK PERSONALIZADO PARA USAR EL CONTEXTO DEL CARRITO
 * 
 * Este hook permite a cualquier componente acceder fácilmente al contexto del carrito
 * sin necesidad de usar useContext directamente.
 * 
 * @returns {Object} - Objeto con todos los valores y funciones del contexto del carrito
 * @example
 * const { cart, addToCart, removeFromCart } = useCart();
 */
export function useCart() {
    return useContext(CartContext);
} 
