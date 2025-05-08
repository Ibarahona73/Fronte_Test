import { Link } from "react-router-dom";
import React from 'react'

export function Navigation({ onFilterChange = () => {} }) {
    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#2c3e50',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            {/* Barra superior con logo y navegación */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: '1px solid #34495e'
            }}>
                <Link 
                    to="/" 
                    style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span>Tienda Online</span>
                </Link>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link 
                        to="/inventario" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            padding: '8px 15px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease',
                            ':hover': {
                                backgroundColor: '#34495e'
                            }
                        }}
                    >
                        Inventario
                    </Link>
                    
                    <Link 
                        to="/ventas-create" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            padding: '8px 15px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease',
                            ':hover': {
                                backgroundColor: '#34495e'
                            }
                        }}
                    >
                        Crear Venta
                    </Link>
                </div>
            </div>

            {/* Barra de filtros */}
            <div style={{
                display: 'flex',
                gap: '10px',
                padding: '12px 20px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                alignItems: 'center'
            }}>
                <span style={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    marginRight: '10px'
                }}>Filtros:</span>
                
                <select 
                    onChange={(e) => onFilterChange('categoria', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Todas categorías</option>
                    <option value="Hombres">Hombres</option>
                    <option value="Mujeres">Mujeres</option>
                    <option value="Niños">Niños</option>
                </select>
                
                <select 
                    onChange={(e) => onFilterChange('tamaño', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Todos tamaños</option>
                    <option value="S">Pequeño (S)</option>
                    <option value="M">Mediano (M)</option>
                    <option value="L">Largo (L)</option>
                    <option value="XL">XL</option>
                </select>
                
                <select 
                    onChange={(e) => onFilterChange('color', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Todos colores</option>
                    <option value="blanco">Blanco</option>
                    <option value="negro">Negro</option>
                    <option value="rojo">Rojo</option>
                    <option value="azul">Azul</option>
                </select>
                
                <select 
                    onChange={(e) => onFilterChange('precio', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minWidth: '140px'
                    }}
                >
                    <option value="">Todos precios</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100+">$100+</option>
                </select>
            </div>
        </div>
    );
}