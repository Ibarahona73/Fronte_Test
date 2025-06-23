/**
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * 
 * Este archivo contiene la estructura principal de la aplicación React.
 * Se encarga de:
 * - Configurar el enrutamiento con React Router
 * - Proporcionar contextos globales (Autenticación, Carrito, PayPal)
 * - Definir todas las rutas de la aplicación
 * - Proteger rutas administrativas
 */

// Importaciones de React y React Router para el enrutamiento
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de páginas principales
import { VisualProducto } from './pages/VisualProducto';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { EntradaStock } from './pages/EntradaStock';
import { SalidaStock } from './pages/SalidaStock';
import { InfoClient } from './pages/infoclient';
import { ClientView } from './pages/ClientView';
import { Carrito } from './pages/Carrito';
import { Envio } from './pages/Envio';
import Login from './pages/login';
import {HistorialCompras} from './pages/historialcompras';
import {AdminHistorialCompras} from './pages/AdminHistorialCompras';
import {DataCliente} from './pages/DataCliente'

// Importaciones de componentes
import { CartProvider } from './components/CartContext'; 
import { Navigation } from './components/Navigation';
import { Edicion } from './components/Edicion';
import { Listado } from './components/Listado';
import { AuthProvider, useAuth } from './components/AuthenticationContext';

// Importaciones de estilos y librerías externas
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

/**
 * COMPONENTE PARA RUTAS SOLO DE ADMINISTRADOR
 * 
 * Este componente protege las rutas administrativas verificando si el usuario
 * tiene permisos de staff/admin antes de permitir el acceso.
 * 
 * @param {Object} children - Los componentes hijos que se renderizarán si el usuario tiene permisos
 * @returns {JSX.Element} - El componente protegido o una redirección
 */
const AdminRoute = ({ children }) => {
    const { isStaff, loading } = useAuth();

    // Mostrar pantalla de carga mientras se verifica la autenticación
    if (loading) {
        return <div>Cargando...</div>; // O un spinner de carga
    }

    // Si el usuario no es staff/admin, redirigir al inicio
    if (!isStaff) {
        console.warn("Intento de acceso a ruta admin sin permisos.");
        return <Navigate to="/" replace />; // Redirige si no es staff/admin
    }

    // Si tiene permisos, renderizar el componente protegido
    return children;
};

/**
 * COMPONENTE PARA MANEJAR LA REDIRECCIÓN CONDICIONAL DEL HISTORIAL
 * 
 * Este componente determina qué vista de historial mostrar basándose en el rol del usuario:
 * - Si es admin/staff: redirige a la vista administrativa del historial
 * - Si es cliente: muestra la vista normal del historial
 * 
 * @returns {JSX.Element} - El componente de historial apropiado
 */
const HistoryRoute = () => {
  const { user, loading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  // Redirigir según el rol del usuario
  if (user?.is_staff) {
    return <Navigate to="/admin/history" replace />;
  } else {
    return <HistorialCompras />;
  }
};

/**
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * 
 * Este componente configura toda la estructura de la aplicación incluyendo:
 * - Proveedores de contexto (Auth, Cart, PayPal)
 * - Enrutamiento con React Router
 * - Todas las rutas públicas y protegidas
 * 
 * @returns {JSX.Element} - La aplicación completa con todos sus contextos y rutas
 */
function App() {
  return (
    // Proveedor de contexto de autenticación (envuelve toda la app)
    <AuthProvider>
      {/* Proveedor de contexto del carrito de compras */}
      <CartProvider>
        {/* Proveedor de PayPal para pagos */}
        <PayPalScriptProvider options={{ "client-id": 
          "AU0_-KUk48ey1OZO6-E6LtGWurwOqweHGaVjZ7O7Ko4nOVbD9aZ1g7kjBPN7qkpBJGZKxOv4nXDDFl3X" }}>
          
          {/* Router principal de la aplicación */}
          <BrowserRouter>
            {/* Barra de navegación que aparece en todas las páginas */}
            <Navigation />
            
            {/* Definición de todas las rutas de la aplicación */}
            <Routes>
              {/* RUTAS PÚBLICAS */}
              
              {/* Vista detallada de un producto específico */}
              <Route path="/producto/:id" element={<VisualProducto />} />
              
              {/* Ruta por defecto - redirige al inicio */}
              <Route path="*" element={<Navigate to="/" replace />} />
              
              {/* Información del cliente */}
              <Route path="/InfoClient/" element={<InfoClient />} />
              
              {/* Historial de compras (redirección condicional) */}
              <Route path="/history" element={<HistoryRoute />} />
              
              {/* Carrito de compras */}
              <Route path="/carrito" element={<Carrito />} />
              
              {/* Página de login */}
              <Route path="/login" element={<Login />} />
              
              {/* Página de envío */}
              <Route path="/envio" element={<Envio />} />
              
              {/* Datos del cliente */}
              <Route path="/datacliente" element={<DataCliente />} />
              
              {/* Página principal - vista del cliente */}
              <Route path="/" element={<ClientView />} />
              
              {/* RUTAS ADMINISTRATIVAS (PROTEGIDAS) */}
              
              {/* Crear nuevo producto */}
              <Route
                path="/admin/create-producto"
                element={
                  <AdminRoute>
                    <CrearInvPedido />
                  </AdminRoute>
                }
              />
              
              {/* Editar producto existente */}
              <Route
                path="/admin/editar-producto/:id"
                element={
                  <AdminRoute>
                    <Edicion />
                  </AdminRoute>
                }
              />
              
              {/* Gestión de inventario */}
              <Route
                path="/admin/inventario"
                element={
                  <AdminRoute>
                    <Listado />
                  </AdminRoute>
                }
              />
              
              {/* Salida de stock de un producto */}
              <Route
                path="/admin/salida-stock/:id"
                element={
                  <AdminRoute>
                    <SalidaStock />
                  </AdminRoute>
                }
              />
              
              {/* Entrada de stock de un producto */}
              <Route
                path="/admin/entrada-stock/:id"
                element={
                  <AdminRoute>
                    <EntradaStock />
                  </AdminRoute>
                }
              />
              
              {/* Historial de compras para administradores */}
              <Route
                path="/admin/history"
                element={
                  <AdminRoute>
                    <AdminHistorialCompras />
                  </AdminRoute>
                }
              />
            </Routes>           
          </BrowserRouter>
        </PayPalScriptProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;