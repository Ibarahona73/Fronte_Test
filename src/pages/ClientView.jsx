import { getProductos } from "../api/datos.api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from "react";
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import useStockRealtimeUpdater from '../components/useStockRealtimeUpdater';

export function ClientView() {
    const { cart } = useCart(); // Obtener el carrito desde el contexto
    const [productos, setProductos] = useState([]); // Todos los productos
    const [filteredProductos, setFilteredProductos] = useState([]); // Productos filtrados
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [stockVisibleData, setStockVisibleData] = useState({});
    const [filters, setFilters] = useState({
        categoria: '',
        tamano: '',
        color: '',
    });

    // Mapeo de tamaños a abreviaciones
    const sizeMap = {
        'Pequeño': 'S',
        'Mediano': 'M',
        'Largo': 'L',
        'Extra Largo': 'XL',
        'XXL': 'XXL'
    };

    const fetchStockVisible = async (productoId) => {
        try {
            const response = await fetch(`https://tiendaonline-backend-yaoo.onrender.com/stockvisible/${productoId}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching stock for product ${productoId}:`, error);
            return null; // Retornar null si hay error
        }
    };

    // Callback memoizado para actualizaciones de stock en tiempo real
    const stockUpdateCallback = useCallback((producto_id, nuevo_stock) => {
        setStockVisibleData(prev => ({
            ...prev,
            [producto_id]: nuevo_stock
        }));
        
        // Actualizar también los productos filtrados
        setProductos(prev => 
            prev.map(prod => 
                prod.id === producto_id 
                    ? { ...prod, cantidad_en_stock: nuevo_stock }
                    : prod
            )
        );
        setFilteredProductos(prev => 
            prev.map(prod => 
                prod.id === producto_id 
                    ? { ...prod, cantidad_en_stock: nuevo_stock }
                    : prod
            )
        );
    }, []);

    useStockRealtimeUpdater(stockUpdateCallback);

    // Cargar productos al montar o cuando cambia el carrito
    useEffect(() => {
        let isMounted = true;

        async function cargaProductos() {
            try {
                const res = await getProductos();
                if (!isMounted) return;

                // Primero obtenemos todos los stocks visibles
                const stockPromises = res.map(producto => 
                    fetchStockVisible(producto.id)
                );
                const stockResults = await Promise.all(stockPromises);

                // Creamos un objeto con los stocks visibles
                const stockData = {};
                res.forEach((producto, index) => {
                    stockData[producto.id] = stockResults[index] !== null ? 
                        stockResults[index] : 
                        producto.cantidad_en_stock;
                });
                setStockVisibleData(stockData);

                // Ahora procesamos los productos con el stock visible
                const productosConImagenes = res.map(producto => {
                    const productoEnCarrito = cart.find((item) => item.id === producto.id);
                    const stockVisible = stockData[producto.id] || producto.cantidad_en_stock;
                    const stockRestante = stockVisible - (productoEnCarrito?.quantity || 0);
                    console.log('stokdata',stockRestante)

                    return {
                        ...producto,
                        tamano: sizeMap[producto.tamano] || producto.tamano,
                        imagen: producto.image 
                            ? `data:image/jpeg;base64,${producto.image}`
                            : null,
                        cantidad_en_stock: stockRestante,
                    };
                });

                setProductos(productosConImagenes);
                setFilteredProductos(productosConImagenes);
            } catch (error) {
                console.error("Error:", error);
                setError("Error al cargar productos");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        cargaProductos();

        return () => { isMounted = false; };
    }, [cart]); // Volver a cargar los productos si el carrito cambia

    // Obtener valores únicos para los filtros
    const uniqueColors = [...new Set(productos.map(p => p.colores).filter(Boolean))];
    const uniqueCategories = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    const uniqueSizes = [...new Set(productos.map(p => p.tamano).filter(Boolean))];

    // Aplicar filtros cada vez que cambian los filtros o los productos
    useEffect(() => {
        let result = [...productos];

        if (filters.categoria) {
            result = result.filter(p => p.categoria === filters.categoria);
        }

        if (filters.tamano) {
            result = result.filter(p => p.tamano === filters.tamano);
        }

        if (filters.color) {
            result = result.filter(p => p.colores === filters.color);
        }

        setFilteredProductos(result);
    }, [filters, productos]);

    // Mostrar mensaje de carga
    if (loading) return (
        <div>            
            <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                fontSize: '1.2rem'
            }}>
                Cargando productos...
            </div>
        </div>
    );

    // Mostrar mensaje de error
    if (error) return (
        <div>            
            <div style={{ 
                padding: '40px', 
                color: 'red', 
                textAlign: 'center',
                fontSize: '1.2rem'
            }}>
                {error}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar de filtros */}
            <div style={{
                width: '250px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #e0e0e0',
                position: 'sticky',
                top: '70px',
                height: 'calc(100vh - 70px)',
                overflowY: 'auto'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Filtros</h3>
                
                {/* Filtro por categoría */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Categoría</h4>
                    {uniqueCategories.map(cat => (
                        <div key={cat} style={{ marginBottom: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="categoria"
                                    checked={filters.categoria === cat}
                                    onChange={() => setFilters({...filters, categoria: cat})}
                                    style={{ marginRight: '8px' }}
                                />
                                {cat}
                            </label>
                        </div>
                    ))}
                    <button 
                        onClick={() => setFilters({...filters, categoria: ''})}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem'
                        }}
                    >
                        Limpiar
                    </button>
                </div>
                
                {/* Filtro por tamaño */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Tamaño</h4>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <div key={size} style={{ marginBottom: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="tamano"
                                    checked={filters.tamano === size}
                                    onChange={() => setFilters({...filters, tamano: size})}
                                    style={{ marginRight: '8px' }}
                                />
                                {size} ({Object.keys(sizeMap).find(key => sizeMap[key] === size)})
                            </label>
                        </div>
                    ))}
                    <button 
                        onClick={() => setFilters({...filters, tamano: ''})}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem'
                        }}
                    >
                        Limpiar
                    </button>
                </div>
                
                {/* Filtro por color */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Color</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {uniqueColors.map((color) => (
                            <div key={color} style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="color"
                                    checked={filters.color === color}
                                    onChange={() => setFilters({ ...filters, color })}
                                    style={{ marginRight: '8px' }}
                                />
                                <div
                                    style={{
                                        display: 'inline-block',
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setFilters({ ...filters, color: '' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem',
                        }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>
            
            {/* Listado de productos */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                padding: '20px',
                justifyContent: 'flex-start',
                alignItems: 'flex-start'
            }}>
                {filteredProductos.map((producto) => (
                    <Link
                        to={`/producto/${producto.id}`}
                        key={producto.id}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div 
                            className="product-item border p-3 d-flex flex-column align-items-center text-center"
                            style={{
                                borderRadius: '5px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                backgroundColor: '#fff',
                                width: '300px'
                            }}
                        >
                            {/* Imagen del producto */}
                            {producto.imagen ? (
                                <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre} 
                                    style={{ 
                                        width: '150px', 
                                        height: '150px', 
                                        objectFit: 'cover', 
                                        borderRadius: '5px', 
                                        marginBottom: '10px' 
                                    }} 
                                />
                            ) : (
                                <div 
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '5px',
                                        fontSize: '0.8rem',
                                        color: '#888',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Sin Imagen
                                </div>
                            )}

                            {/* Nombre del producto */}
                            <h6 className="mb-1">{producto.nombre}</h6>                           

                            {/* Estado del stock */}
                            <small className={`d-block mb-2 ${producto.cantidad_en_stock > 0 ? 'text-success' : 'text-danger'}`}>
                                {producto.cantidad_en_stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </small>                          

                            {/* Precio del producto */}
                            <small className="text-muted d-block mb-1">
                                ${Number(producto.precio).toFixed(2)}
                            </small>                          

                            {/* Colores disponibles */}
                            <small className="text-muted d-block mb-1">
                                {producto.colores ? `${producto.colores.split(',').length} color options` : 'No colors available'}
                            </small>
                            
                            {/* Cantidad del Stock */}
                            <small className="text-muted d-block mb-1">
                                Cantidad Stock: {producto.cantidad_en_stock}
                            </small>
                        </div>
                    </Link>
                ))}

                {/* Mensaje si no hay productos */}
                {filteredProductos.length === 0 && (
                    <div style={{ 
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                        width: '100%'
                    }}>
                        No se encontraron productos con los filtros seleccionados
                    </div>
                )}
            </div>
        </div>
    );
}