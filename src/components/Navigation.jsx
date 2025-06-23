/**
 * COMPONENTE DE NAVEGACIÓN PRINCIPAL
 * 
 * Este componente representa la barra de navegación principal de la aplicación.
 * Proporciona navegación entre las diferentes secciones y funcionalidades:
 * - Navegación principal (Inicio, Inventario, Crear Producto)
 * - Acceso al carrito de compras con contador de productos
 * - Menú de usuario con opciones de autenticación
 * - Enlaces administrativos para usuarios con permisos
 * 
 * Características:
 * - Diseño responsive con Bootstrap
 * - Dropdown para opciones de usuario
 * - Contador de productos en el carrito
 * - Control de acceso basado en roles
 * - Navegación programática con React Router
 */

// Importaciones de React y hooks necesarios
import React, { useState, useRef, useEffect } from 'react';

// Importaciones de React Router para navegación
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Importaciones de contextos para acceder a datos globales
import { useCart } from './CartContext';
import { useAuth } from '../components/AuthenticationContext';

/**
 * COMPONENTE DE BARRA DE NAVEGACIÓN PRINCIPAL
 * 
 * Este componente renderiza la barra de navegación que aparece en todas las páginas.
 * Maneja la navegación, el estado del carrito y las opciones de usuario.
 * 
 * @returns {JSX.Element} - La barra de navegación completa
 */
export function Navigation() {
    // Obtener datos del carrito desde el contexto global
    const { cart } = useCart();
    
    // Hook para obtener la ruta actual
    const location = useLocation();
    
    // Hook para navegar programáticamente
    const navigate = useNavigate();
    
    // Obtener el usuario y la función logout del contexto de autenticación
    const { user, logout } = useAuth();

    // Estado para controlar la visibilidad del dropdown de usuario
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Referencia para el contenedor del dropdown (para cerrar al hacer clic fuera)
    const dropdownRef = useRef(null);

    /**
     * CALCULAR TOTAL DE PRODUCTOS EN EL CARRITO
     * 
     * Suma la cantidad de todos los productos en el carrito
     * para mostrar el contador en el ícono del carrito.
     */
    const totalItems = cart.reduce((total, item) => total + item.cantidad_prod, 0);

    /**
     * ALTERNAR VISIBILIDAD DEL DROPDOWN
     * 
     * Función para abrir/cerrar el menú desplegable del usuario.
     */
    const toggleDropdown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    /**
     * MANEJAR CIERRE DE SESIÓN
     * 
     * Función que se ejecuta cuando el usuario hace logout.
     * Limpia la sesión y redirige al inicio.
     */
    const handleLogout = () => {
        logout(); // Limpiar datos de sesión
        setIsDropdownOpen(false); // Cerrar el dropdown
        navigate('/'); // Redirigir al inicio
    };

    /**
     * EFECTO PARA CERRAR DROPDOWN AL HACER CLIC FUERA
     * 
     * Este useEffect agrega un listener para detectar clics fuera del dropdown
     * y cerrarlo automáticamente.
     */
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
            backgroundColor: '#a21d22', // Color rojo corporativo
            padding: '10px 0',
            minHeight: '60px',
            fontFamily: 'Poppins, sans-serif',
            position: 'sticky', // Barra fija en la parte superior
            top: 0,
            zIndex: 1020 // z-index alto para que esté sobre otros elementos
        }}>
            <div className="container-fluid">
                {/* BOTÓN DE INICIO CON LOGO Y TEXTO */}
                <Link className="navbar-brand text-white d-flex align-items-center" to="/" style={{ marginLeft: '20px' }}>
                <img
                    src="/logosinfondo.png"
                    alt="Logo UTH"
                    style={{ height: '50px', marginRight: '30px', background: 'transparent' }}
                />
                    <span style={{ fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif' }}>Inicio</span>
                </Link>

                {/* ENLACES DE ADMINISTRACIÓN */}
                {/* Solo se muestran para usuarios con permisos de staff o superuser */}
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

                {/* CONTENEDOR DE ELEMENTOS DERECHOS */}
                <div className="d-flex align-items-center" style={{ marginLeft: 'auto', marginRight: '20px' }}>
                    
                    {/* ÍCONO DEL CARRITO */}
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
                        
                        {/* CONTADOR DE PRODUCTOS EN EL CARRITO */}
                        {/* Solo se muestra si hay al menos un producto */}
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

                    {/* ÍCONO DE USUARIO Y DROPDOWN */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            className="nav-link"
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

                        {/* MENÚ DESPLEGABLE */}
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
                                    // OPCIONES SI NO ESTÁ LOGEADO
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
                                    // OPCIONES SI ESTÁ LOGEADO
                                    <>
                                     <Link
                                            to={user?.is_staff ? "/admin/history" : "/history"} // Enlace condicional según rol
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