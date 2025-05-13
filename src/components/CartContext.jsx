import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [stock, setStock] = useState({}); // Nuevo estado para manejar el stock

    const addToCart = (product, quantity) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, product.cantidad_en_stock) }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });

        // Reducir el stock dinámicamente
        setStock((prevStock) => ({
            ...prevStock,
            [product.id]: (prevStock[product.id] || product.cantidad_en_stock) - quantity,
        }));
    };

    const updateCartQuantity = (id, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const removeFromCart = (id) => {
        const product = cart.find((item) => item.id === id);
        if (product) {
            // Restaurar el stock al eliminar un producto del carrito
            setStock((prevStock) => ({
                ...prevStock,
                [id]: (prevStock[id] || product.cantidad_en_stock) + product.quantity,
            }));
        }

        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const cartTotal = cart.reduce((total, item) => total + item.precio * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, stock }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}