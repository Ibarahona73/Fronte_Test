import { useEffect, useState } from "react";
import { getProductos } from "../api/datos.api";
import { Navigation } from './Navigation';
import React from 'react'

export function Listado() {
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        categoria: '',
        tamaño: '',
        color: '',
    });
    const API_BASE_URL = 'https://tiendaonline-backend-yaoo.onrender.com';

    // Obtener valores únicos para los filtros
    const uniqueColors = [...new Set(productos.map(p => p.colores).filter(Boolean))];
    const uniqueCategories = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    const uniqueSizes = [...new Set(productos.map(p => p.tamaño).filter(Boolean))];

    // Mapeo de tamaños a abreviaciones
    const sizeMap = {
        'Pequeño': 'S',
        'Mediano': 'M',
        'Largo': 'L',
        'Extra Largo': 'XL',
        'XXL': 'XXL'
    };

    useEffect(() => {
        let isMounted = true;
        
        async function cargaProductos() {
            try {
                const res = await getProductos();
                if (!isMounted) return;
                
                const productosConImagenes = res.map(producto => ({
                    ...producto,
                    imagen: producto.imagen 
                        ? (producto.imagen.startsWith('http') 
                            ? producto.imagen 
                            : `${API_BASE_URL}${producto.imagen}`)
                        : null,
                    // Normalizar tamaños
                    tamaño: sizeMap[producto.tamaño] || producto.tamaño
                }));
                
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
    }, []);

    // Aplicar filtros
    useEffect(() => {
        let result = [...productos];
        
        if (filters.categoria) {
            result = result.filter(p => p.categoria === filters.categoria);
        }
        
        if (filters.tamaño) {
            result = result.filter(p => p.tamaño === filters.tamaño);
        }
        
        if (filters.color) {
            result = result.filter(p => p.colores === filters.color);
        }
        
        setFilteredProductos(result);
    }, [filters, productos]);

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
                                    name="tamaño"
                                    checked={filters.tamaño === size}
                                    onChange={() => setFilters({...filters, tamaño: size})}
                                    style={{ marginRight: '8px' }}
                                />
                                {size} ({Object.keys(sizeMap).find(key => sizeMap[key] === size)})
                            </label>
                        </div>
                    ))}
                    <button 
                        onClick={() => setFilters({...filters, tamaño: ''})}
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
                    {uniqueColors.map(color => (
                        <div key={color} style={{ marginBottom: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="color"
                                    checked={filters.color === color}
                                    onChange={() => setFilters({...filters, color: color})}
                                    style={{ marginRight: '8px' }}
                                />
                                <div style={{
                                    display: 'inline-block',
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: color,
                                    borderRadius: '50%',
                                    marginRight: '8px',
                                    border: '1px solid #ddd'
                                }} />
                                {color}
                            </label>
                        </div>
                    ))}
                    <button 
                        onClick={() => setFilters({...filters, color: ''})}
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
            </div>
            
            {/* Listado de productos */}
            <div style={{ 
                flex: 1,
                display: 'grid',
                //gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                padding: '15px',
                alignContent: 'flex-start'
            }}>
                {filteredProductos.map(producto => (
                    <div key={producto.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '280px', // Altura fija para todos los productos
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        {/* Imagen del producto */}
                        <div style={{
                            width: '100%',
                            height: '120px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            marginBottom: '10px'
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
                                    onError={(e) => {
                                        e.target.onerror = null; // Evitar bucle infinito                                        
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin imagen</span>
                            )}
                        </div>
                        
                        {/* Nombre del producto */}
                        <div style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {producto.nombre}
                        </div>
                        
                        {/* Precio */}
                        <div style={{ 
                            marginBottom: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.8rem',
                                color: '#666'
                            }}>Precio:</div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>${producto.precio}</div>
                        </div>
                        
                        {/* Stock (solo si existe) */}
                        {producto.cantidad_en_stock !== undefined && (
                            <div style={{ 
                                marginBottom: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#666'
                                }}>Stock:</div>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: producto.cantidad_en_stock > 0 ? '#27ae60' : '#e74c3c',
                                    fontSize: '0.9rem'
                                }}>
                                    {producto.cantidad_en_stock}
                                </div>
                            </div>
                        )}
                        
                        {/* Color */}
                        {producto.colores && (
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 'auto'
                            }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    marginRight: '6px'
                                }}>Color:</div>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: producto.colores,
                                    borderRadius: '50%',
                                    border: '1px solid #ddd'
                                }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}