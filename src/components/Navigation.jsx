import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from '../components/AuthenticationContext';

// Componente de barra de navegación principal
export function Navigation() {
    const { cart } = useCart(); // Obtiene el carrito desde el contexto global
    const location = useLocation(); // Hook para obtener la ruta actual
    const navigate = useNavigate(); // Hook para navegar programáticamente
    const { user, logout } = useAuth(); // Obtiene el usuario y la función logout del contexto

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar el dropdown
    const dropdownRef = useRef(null); // Referencia para el contenedor del dropdown

    // Calcula el total de productos en el carrito
    const totalItems = cart.reduce((total, item) => total + item.cantidad_prod, 0);

    // Función para alternar la visibilidad del dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false); // Cierra el dropdown después de cerrar sesión
        navigate('/'); // Redirige al inicio después de cerrar sesión
    };

    // Efecto para cerrar el dropdown cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        // Adjuntar el listener al montar el componente
        document.addEventListener("mousedown", handleClickOutside);
        // Limpiar el listener al desmontar el componente
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]); // Dependencia en dropdownRef

    return (
        <nav className="navbar navbar-expand-lg" style={{ 
            backgroundColor: '#a21d22',
            padding: '10px 0',
            minHeight: '60px',
            fontFamily: 'Poppins, sans-serif',
            position: 'sticky',
            top: 0,
            zIndex: 1020 // z-index alto para que esté sobre otros elementos
        }}>
            <div className="container-fluid">
                {/* Botón de inicio a la izquierda */}
                <Link className="navbar-brand text-white" to="/" style={{ 
                    fontSize: '1.1rem',
                    marginLeft: '20px',
                    fontFamily: 'Poppins, sans-serif'
                }}>Inicio</Link>

                {/* Enlaces de administración para usuarios admin o superuser */}
                {(user?.is_staff || user?.is_superuser) && (
                    <>
                        <Link className="navbar-brand text-white" to="/admin/inventario" style={{ 
                            fontSize: '1.1rem',
                            marginLeft: '30px',
                            fontFamily: 'Poppins, sans-serif'
                        }}>Inventario</Link>
                        <Link className="navbar-brand text-white" to="/admin/create-producto" style={{ 
                            fontSize: '1.1rem',
                            marginLeft: '30px',
                            fontFamily: 'Poppins, sans-serif'
                        }}>Crear Producto</Link>
                    </>
                )}

                <div className="d-flex align-items-center" style={{ marginLeft: 'auto', marginRight: '20px' }}>
                    {/* Ícono del carrito */}
                    <Link className="nav-link text-white" to="/carrito" style={{ position: 'relative', marginRight: '15px' }}>
                        <i className="bi bi-cart" style={{ 
                            fontSize: '1.8rem',
                            backgroundColor: '#6c757d',
                            borderRadius: '50%',
                            padding: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px'
                        }}></i>
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

                    {/* Ícono de usuario y dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            className="nav-link" // Usamos button para manejar el click
                            onClick={toggleDropdown} // Llama a toggleDropdown al hacer click
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '0',
                                cursor: 'pointer',
                                color: 'white',
                            }}
                        >
                            <i className="bi bi-person-circle"
                                style={{
                                    fontSize: '1.8rem',
                                    color:'white',
                                    backgroundColor: '#6c757d',
                                    borderRadius: '50%',
                                    padding: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px'
                                }}>
                            </i>
                        </button>

                        {/* Menú desplegable */}
                        {isDropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%', // Posiciona debajo del ícono
                                    right: '0',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    minWidth: '150px',
                                    zIndex: 1000, // Asegura que esté encima de otros elementos
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '10px 0',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                {!user ? (
                                    // Opciones si no está loggeado
                                    <Link
                                        to="/login"
                                        onClick={() => setIsDropdownOpen(false)} // Cierra dropdown al hacer click
                                        style={{
                                            padding: '8px 15px',
                                            textDecoration: 'none',
                                            color: '#333',
                                            fontFamily: 'Poppins, sans-serif',
                                            '&:hover': { backgroundColor: '#f0f0f0' }, // Estilo hover simple
                                        }}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                ) : (
                                    // Opciones si está loggeado
                                    <>
                                     <Link
                                            to={user?.is_staff ? "/admin/history" : "/history"} // Enlace condicional
                                            onClick={() => setIsDropdownOpen(false)} // Cierra dropdown al hacer click
                                            style={{
                                                padding: '8px 15px',
                                                textDecoration: 'none',
                                                color: '#333',
                                                fontFamily: 'Poppins, sans-serif',
                                                '&:hover': { backgroundColor: '#f0f0f0' },
                                            }}
                                        >
                                            Historial de Compras
                                        </Link>
                                        <Link
                                            to="/datacliente"
                                            onClick={() => setIsDropdownOpen(false)} // Cierra dropdown al hacer click
                                            style={{
                                                padding: '8px 15px',
                                                textDecoration: 'none',
                                                color: '#333',
                                                fontFamily: 'Poppins, sans-serif',
                                                '&:hover': { backgroundColor: '#f0f0f0' },
                                            }}
                                        >
                                            Administrar Cuenta
                                        </Link>
                                        <button
                                            onClick={handleLogout} // Llama a handleLogout
                                            style={{
                                                padding: '8px 15px',
                                                textAlign: 'left',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: '#333',
                                                fontFamily: 'Poppins, sans-serif',
                                                '&:hover': { backgroundColor: '#f0f0f0' },
                                            }}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}