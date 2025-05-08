// Este componente ya no sería necesario si usas el diseño directo en Listado
// Pero lo dejo por si lo necesitas para otras vistas
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Card({ producto }) {
    const navigate = useNavigate();

    return (
        <div 
            style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                ':hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                }
            }}
            onClick={() => navigate(`/productos/${producto.id}/`)}
        >
            <div style={{
                height: '120px',
                backgroundColor: '#f5f5f5',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '5px',
                overflow: 'hidden'
            }}>
                {producto.imagen && (
                    <img 
                        src={producto.imagen} 
                        alt={producto.nombre}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                {producto.nombre}
            </h3>
            
            <p style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: 'bold' }}>
                ${producto.precio}
            </p>
            
            <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                Stock: {producto.cantidad_en_stock}
            </p>
        </div>
    );
}