import React, { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de importar loginUser si lo usas dentro de este contexto
import { loginUser } from '../api/datos.api'; // <-- descomenta si es necesario

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Estado para el usuario (puede ser null si no está loggeado)
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    // Cambiado de isAdmin a isStaff
    const [isStaff, setIsStaff] = useState(false);
    const [loading, setLoading] = useState(true); // Para saber si ya verificamos el login inicial

    useEffect(() => {
        // Al cargar la app, verifica si hay token y usuario en localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('usuario');

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setToken(storedToken);
                // *** CORRECCIÓN: Verifica si es staff O superuser ***
                setIsStaff(userData?.is_staff === true || userData?.is_superuser === true);
            } catch (e) {
                console.error("Error parsing user data from localStorage:", e);
                logout(); // Limpia si los datos están corruptos
            }
        }
        setLoading(false); // Terminó la verificación inicial
    }, []);

    // Función de login (si manejas el login DENTRO del contexto)
    // Si el login se maneja fuera (como en tu login.jsx), este método solo actualizaría el estado
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
                 setIsStaff(data.user?.is_staff === true || data.user?.is_superuser === true);
                 localStorage.setItem('usuario', JSON.stringify(data.user));                 
                 
            } else {
                 // Si no hay objeto user, asume que no es staff
                 setUser(null);
                 setIsStaff(false);
                 console.warn("Login response did not include user data for staff check.");
            }

            localStorage.setItem('token', data.token);
            console.log('algo diferente',data.user)

            return { success: true, user: data.user }; // Retorna también los datos del usuario
        } catch (error) {
            console.error("Login failed:", error);
            // Propaga el error para que el componente de login lo capture
            throw error; // Propaga el error original para el manejo en el componente login
        }
    };

    // Función de logout
    const logout = () => {
        setUser(null);
        setToken(null);
        setIsStaff(false); // Reinicia isStaff a false
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    };

    return (
        // Expone isStaff en lugar de isAdmin
        <AuthContext.Provider value={{ user, token, isStaff, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
