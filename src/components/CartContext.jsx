import React, { createContext, useContext, useState } from 'react';

// Crear el contexto del carrito
const CartContext = createContext();

export function CartProvider({ children }) {
    // Estado para el carrito de compras
    const [cart, setCart] = useState([]);
    // Estado para manejar el stock de productos en el carrito
    const [stock, setStock] = useState({});

    // Agregar un producto al carrito
    const addToCart = (product, quantity) => {
        setCart((prevCart) => {
            // Verifica si el producto ya está en el carrito
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                // Si ya existe, actualiza la cantidad (sin exceder el stock)
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, product.cantidad_en_stock) }
                        : item
                );
            }
            // Si no existe, lo agrega al carrito
            return [...prevCart, { ...product, quantity }];
        });

        // Reducir el stock dinámicamente al agregar al carrito
        setStock((prevStock) => ({
            ...prevStock,
            [product.id]: (prevStock[product.id] || product.cantidad_en_stock) - quantity,
        }));
    };

    // Actualizar la cantidad de un producto en el carrito
    const updateCartQuantity = (id, quantity) => {
        // Recorre cada producto del carrito
        setCart((prevCart) =>
            prevCart.map((item) =>
                // Si el id coincide, actualiza la cantidad directamente
                item.id === id ? { ...item, quantity: quantity }
                // Si no coincide, deja el producto igual
                : item
            )
        );
    };

    // Eliminar un producto del carrito y restaurar su stock
    const removeFromCart = (id) => {
        const product = cart.find((item) => item.id === id);
        if (product) {
            // Restaura el stock al eliminar el producto
            setStock((prevStock) => ({
                ...prevStock,
                [id]: (prevStock[id] || product.cantidad_en_stock) + product.quantity,
            }));
        }

        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Vaciar el carrito y restaurar el stock
    const clearCart = () => {
        setCart([]);
        setStock({});
    };

    // Calcular el total del carrito
    const cartTotal = cart.reduce((total, item) => total + item.precio * item.quantity, 0);

    // Proveer el contexto a los componentes hijos
    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            cartTotal,
            stock,
            clearCart // Permite vaciar el carrito desde otros componentes
        }}>
            {children}
        </CartContext.Provider>
    );
}

// Hook personalizado para usar el contexto del carrito
export function useCart() {
    return useContext(CartContext);
}