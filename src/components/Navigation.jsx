import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';

// Componente de barra de navegación principal
export function Navigation() {
    const { cart } = useCart(); // Obtiene el carrito desde el contexto global
    const location = useLocation(); // Hook para obtener la ruta actual

    // Calcula el total de productos en el carrito
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#a21d22' }}>
            <div className="container-fluid">
                {/* Botón de inicio a la izquierda */}
                <Link className="navbar-brand text-white" to="/">Inicio</Link>

                {/* Mostrar "Crear Prod" solo si la ruta es /inventario */}
                {location.pathname === '/inventario' && (
                    <Link className="navbar-brand text-white" to="/crearprod">Crear Prod</Link>
                )}

                <div className="d-flex ms-auto">
                    {/* Ícono del carrito a la derecha */}
                    <Link className="nav-link text-white" to="/carrito" style={{ position: 'relative' }}>
                        <i className="bi bi-cart" style={{ fontSize: '1.8rem' }}></i>
                        {/* Muestra la cantidad de productos si hay al menos uno */}
                        {totalItems > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-10px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '0.8rem',
                            }}>
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
            {/* Ícono de usuario a la derecha */}
            <div className="ms-auto d-flex align-items-center gap-3">                                    
                <Link to="/login" className="nav-link">
                    <i className="bi bi-person-circle" 
                        style={{ 
                            fontSize: '1.8rem',
                            color:'white',
                            padding: '15px'
                        }}>
                    </i>
                </Link>
            </div>
        </nav>
    );
}