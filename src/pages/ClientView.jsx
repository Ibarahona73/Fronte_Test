import { getProductos } from "../api/datos.api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from "react";
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import useStockRealtimeUpdater from '../components/useStockRealtimeUpdater';
import { ProductCarousel } from '../components/ProductCarousel';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import useWindowSize from "../components/useWindowSize";
import { useAuth } from "../components/AuthenticationContext";

export function ClientView() {
    const { cart } = useCart(); // Obtener el carrito desde el contexto
    const { authTokens } = useAuth(); // Obtener tokens para la autenticación
    const [productos, setProductos] = useState([]); // Todos los productos
    const [carouselProducts, setCarouselProducts] = useState([]); // Productos para el carrusel
    const [filteredProductos, setFilteredProductos] = useState([]); // Productos filtrados
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [stockVisibleData, setStockVisibleData] = useState({});
    const [filters, setFilters] = useState({
        categoria: '',
        tamano: '',
        color: '',
    });
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const isSmallScreen = width < 992; // Breakpoint para tablets y móviles
    const [filtersOpen, setFiltersOpen] = useState(false); // Estado para filtros en móvil

    // Mapeo de tamaños a abreviaciones
    const sizeMap = {
        'Pequeño': 'S',
        'Mediano': 'M',
        'Largo': 'L',
        'Extra Largo': 'XL',
        'XXL': 'XXL'
    };

    const fetchStockVisible = useCallback(async (productoId) => {
        try {
            const headers = { 'Content-Type': 'application/json' };
            // Si hay tokens, los añadimos a la cabecera de la petición
            if (authTokens) {
                headers['Authorization'] = 'Bearer ' + String(authTokens.access);
            }

            const response = await fetch(`https://tiendaonline-backend-yaoo.onrender.com/stockvisible/${productoId}/`, {
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching stock for product ${productoId}:`, error);
            return null; // Retornar null si hay error
        }
    }, [authTokens]);

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

                // Barajar productos para el carrusel
                const shuffled = [...productosConImagenes].sort(() => 0.5 - Math.random());
                setCarouselProducts(shuffled.slice(0, 4));

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
    }, [cart, fetchStockVisible]); // Volver a cargar si el carrito o la función de fetch cambian

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
        <div style={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row' }}>
            {/* Sidebar de filtros */}
            <div style={{
                width: isSmallScreen ? '100%' : '250px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRight: isSmallScreen ? 'none' : '1px solid #e0e0e0',
                borderBottom: isSmallScreen ? '1px solid #e0e0e0' : 'none',
                position: isSmallScreen ? 'relative' : 'sticky',
                top: isSmallScreen ? 'auto' : '80px',
                height: isSmallScreen ? 'auto' : 'calc(100vh - 80px)',
                overflowY: 'auto',
                zIndex: 1,
                boxShadow: '0 0 15px rgba(0,0,0,0.07)'
            }}>
                {isSmallScreen && (
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: filtersOpen ? '20px' : '0',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            textAlign: 'center',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'margin-bottom 0.3s ease'
                        }}
                    >
                        {filtersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                )}
                <div style={{ display: isSmallScreen && !filtersOpen ? 'none' : 'block' }}>
                    <h3 style={{ 
                        marginTop: 0, 
                        marginBottom: '25px', 
                        fontSize: '1.4rem', 
                        fontFamily: 'Poppins, sans-serif'
                    }}>Filtros</h3>
                    
                    {/* Filtro por categoría */}
                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ 
                            marginBottom: '15px', 
                            fontSize: '1rem', 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            color: '#333'
                        }}>Categoría</h4>
                        {uniqueCategories.map(cat => (
                            <div key={cat} style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
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
                                color: '#007bff',
                                cursor: 'pointer',
                                padding: '5px 0',
                                fontSize: '0.85rem',
                                marginTop: '5px'
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                    
                    {/* Filtro por tamaño */}
                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ 
                            marginBottom: '15px', 
                            fontSize: '1rem', 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            color: '#333'
                        }}>Tamaño</h4>
                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <div key={size} style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
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
                                color: '#007bff',
                                cursor: 'pointer',
                                padding: '5px 0',
                                fontSize: '0.85rem',
                                marginTop: '5px'
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                    
                    {/* Filtro por color */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ 
                            marginBottom: '15px', 
                            fontSize: '1rem', 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            color: '#333'
                        }}>Color</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '10px' }}>
                            {uniqueColors.map((color) => (
                                <div key={color} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setFilters({ ...filters, color })}>
                                    <input
                                        type="radio"
                                        name="color"
                                        checked={filters.color === color}
                                        readOnly
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        style={{
                                            width: '25px',
                                            height: '25px',
                                            backgroundColor: color,
                                            borderRadius: '50%',
                                            border: filters.color === color ? '2px solid #007bff' : '1px solid #ddd',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                                color: '#007bff',
                                cursor: 'pointer',
                                padding: '5px 0',
                                fontSize: '0.85rem',
                                marginTop: '15px'
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>
            
            <div style={{ flex: 1, padding: isSmallScreen ? '20px 10px' : '20px' }}>
                {/* Carousel de productos */}
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <ProductCarousel products={carouselProducts} />
                </div>

                {/* Listado de productos */}
                <h2 style={{ marginBottom: '20px', marginTop: '40px' }}>Todos los productos</h2>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px',
                }}>
                    {filteredProductos.map((producto) => (
                        <div
                            key={producto.id}
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onClick={() => navigate(`/producto/${producto.id}`)}
                        >
                            <div style={{
                                height: '200px',
                                backgroundColor: '#f5f5f5',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '5px',
                                overflow: 'hidden'
                            }}>
                                {producto.imagen ? (
                                    <img 
                                        src={producto.imagen} 
                                        alt={producto.nombre}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <span style={{color: '#aaa'}}>Sin imagen</span>
                                )}
                            </div>
                            
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#333' }}>
                                {producto.nombre}
                            </h3>
                            
                            <p style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                ${Number(producto.precio).toFixed(2)}
                            </p>
                            
                            <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                {producto.cantidad_en_stock > 0 ? `Stock: ${producto.cantidad_en_stock}` : 'Agotado'}
                            </p>
                        </div>
                    ))}

                    {/* Mensaje si no hay productos */}
                    {filteredProductos.length === 0 && (
                        <div style={{ 
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666',
                            width: '100%',
                            gridColumn: '1 / -1' // Ocupar todo el ancho de la grilla
                        }}>
                            No se encontraron productos con los filtros seleccionados
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}