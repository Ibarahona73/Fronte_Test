/**
 * CONTEXTO DE AUTENTICACIÓN
 * 
 * Este archivo maneja toda la lógica de autenticación de la aplicación.
 * Proporciona un contexto global que permite a cualquier componente:
 * - Verificar si el usuario está autenticado
 * - Obtener información del usuario actual
 * - Verificar permisos de administrador/staff
 * - Manejar login y logout
 * - Persistir la sesión en localStorage
 * 
 * Funcionalidades principales:
 * - Gestión de estado de autenticación
 * - Verificación automática de sesión al cargar la app
 * - Control de acceso basado en roles (staff/admin)
 * - Persistencia de datos de sesión
 * - Manejo de tokens de autenticación
 */

// Importaciones de React para el contexto y hooks
import React, { createContext, useContext, useState, useEffect } from 'react';

// Importación de función de login de la API (comentada por defecto)
// Asegúrate de importar loginUser si lo usas dentro de este contexto
import { loginUser } from '../api/datos.api'; // <-- descomenta si es necesario

// Crear el contexto de autenticación
const AuthContext = createContext(null);

/**
 * PROVEEDOR DEL CONTEXTO DE AUTENTICACIÓN
 * 
 * Este componente proporciona el contexto de autenticación a toda la aplicación.
 * Maneja toda la lógica de estado y operaciones de autenticación.
 * 
 * @param {Object} children - Los componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} - El proveedor del contexto con toda la funcionalidad
 */
export const AuthProvider = ({ children }) => {
    // Estado para el usuario (puede ser null si no está loggeado)
    const [user, setUser] = useState(null);
    
    // Estado para el token de autenticación
    const [token, setToken] = useState(null);
    
    // Estado para verificar si el usuario es staff/admin
    // Cambiado de isAdmin a isStaff para mayor claridad
    const [isStaff, setIsStaff] = useState(false);
    
    // Estado de carga - indica si ya verificamos el login inicial
    const [loading, setLoading] = useState(true);

    /**
     * VERIFICAR SESIÓN AL CARGAR LA APLICACIÓN
     * 
     * Este useEffect se ejecuta una sola vez al montar el componente
     * para verificar si hay una sesión activa en localStorage.
     */
    useEffect(() => {
        // Al cargar la app, verifica si hay token y usuario en localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('usuario');

        if (storedToken && storedUser) {
            try {
                // Parsear los datos del usuario almacenados
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setToken(storedToken);
                
                // *** CORRECCIÓN: Verifica si es staff O superuser ***
                // Un usuario puede ser staff o superuser, ambos tienen permisos administrativos
                setIsStaff(userData?.is_staff === true || userData?.is_superuser === true);
            } catch (e) {
                console.error("Error parsing user data from localStorage:", e);
                logout(); // Limpia si los datos están corruptos
            }
        }
        setLoading(false); // Terminó la verificación inicial
    }, []);

    /**
     * FUNCIÓN DE LOGIN
     * 
     * Esta función maneja el proceso de login del usuario.
     * Si el login se maneja fuera del contexto (como en login.jsx), 
     * este método solo actualizaría el estado.
     * 
     * @param {Object} data - Datos de respuesta del login (token y user)
     * @returns {Object} - Objeto con success y datos del usuario
     * @throws {Error} - Si el login falla
     */
    const login = async (data) => {
        try {
            // Si loginUser está importado y definido para usar aquí
            //const data = await loginUser(email, password); // loginUser ahora guarda el objeto user
            console.log('auth',data)
            setToken(data.token);
            
            // Asumiendo que loginUser devuelve un objeto con 'user'
            if (data.user) {
                 setUser(data.user);
                 
                 // *** CORRECCIÓN: Verifica si es staff O superuser al hacer login ***
                 // Un usuario puede ser staff o superuser, ambos tienen permisos administrativos
                 setIsStaff(data.user?.is_staff === true || data.user?.is_superuser === true);
                 
                 // Guardar datos del usuario en localStorage para persistencia
                 localStorage.setItem('usuario', JSON.stringify(data.user));                 
                 
            } else {
                 // Si no hay objeto user, asume que no es staff
                 setUser(null);
                 setIsStaff(false);
                 console.warn("Login response did not include user data for staff check.");
            }

            // Guardar token en localStorage para persistencia
            localStorage.setItem('token', data.token);
            console.log('algo diferente',data.user)

            return { success: true, user: data.user }; // Retorna también los datos del usuario
        } catch (error) {
            console.error("Login failed:", error);
            // Propaga el error para que el componente de login lo capture
            throw error; // Propaga el error original para el manejo en el componente login
        }
    };

    /**
     * FUNCIÓN DE LOGOUT
     * 
     * Esta función limpia toda la información de sesión del usuario:
     * - Limpia el estado local
     * - Elimina datos del localStorage
     * - Reinicia permisos de staff
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        setIsStaff(false); // Reinicia isStaff a false
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    };

    /**
     * PROVEER EL CONTEXTO A LOS COMPONENTES HIJOS
     * 
     * Retorna el proveedor del contexto con todos los valores y funciones
     * que estarán disponibles para cualquier componente hijo.
     */
    return (
        // Expone isStaff en lugar de isAdmin para mayor claridad
        <AuthContext.Provider value={{ 
            user,        // Datos del usuario actual
            token,       // Token de autenticación
            isStaff,     // Indica si el usuario es staff/admin
            loading,     // Estado de carga inicial
            login,       // Función para hacer login
            logout       // Función para hacer logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * HOOK PERSONALIZADO PARA USAR EL CONTEXTO DE AUTENTICACIÓN
 * 
 * Este hook permite a cualquier componente acceder fácilmente al contexto de autenticación
 * sin necesidad de usar useContext directamente.
 * 
 * @returns {Object} - Objeto con todos los valores y funciones del contexto de autenticación
 * @example
 * const { user, isStaff, login, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);
