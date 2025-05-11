import { useEffect, useState } from "react";
import { getProductos } from "../api/datos.api";
import { Navigation } from './Navigation';
import React from 'react';

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

    const uniqueColors = [...new Set(productos.map(p => p.colores).filter(Boolean))];
    const uniqueCategories = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    const uniqueSizes = [...new Set(productos.map(p => p.tamaño).filter(Boolean))];

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
            
            <div style={{ 
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '20px',
                alignContent: 'flex-start'
            }}>
                {filteredProductos.map(producto => (
                    <div key={producto.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        ':hover': {
                            transform: 'translateY(-5px)'
                        }
                    }}>
                        <div style={{
                            width: '100%',
                            height: '180px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            marginBottom: '15px'
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
                                        e.target.onerror = null;                                        
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#999', fontSize: '0.9rem' }}>Sin imagen disponible</span>
                            )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                textAlign: 'center'
                            }}>
                                {producto.nombre}
                            </div>
                            
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Precio:</div>
                                    <div style={{ fontWeight: 'bold' }}>${producto.precio}</div>
                                </div>
                                {producto.cantidad_en_stock !== undefined && (
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Stock:</div>
                                        <div style={{ 
                                            fontWeight: 'bold',
                                            color: producto.cantidad_en_stock > 0 ? '#27ae60' : '#e74c3c'
                                        }}>
                                            {producto.cantidad_en_stock}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 'auto'
                            }}>
                                {producto.tamaño && (
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Tamaño:</div>
                                        <div>{producto.tamaño}</div>
                                    </div>
                                )}
                                
                                {producto.colores && (
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Color:</div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: producto.colores,
                                                borderRadius: '50%',
                                                border: '1px solid #ddd',
                                                marginRight: '5px'
                                            }} />
                                            {producto.colores}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredProductos.length === 0 && (
                    <div style={{ 
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        No se encontraron productos con los filtros seleccionados
                    </div>
                )}
            </div>
        </div>
    );
}