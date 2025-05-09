import { Link } from "react-router-dom";
import React from 'react'

export function Navigation() {
    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#2c3e50',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
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
        </div>
    );
}