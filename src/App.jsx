import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VisualProducto } from './pages/VisualProducto';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { CartProvider } from './components/CartContext'; 
import { Navigation } from './components/Navigation';
import { EntradaStock } from './pages/EntradaStock';
import { SalidaStock } from './pages/SalidaStock';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { InfoClient } from './pages/infoclient';
import { ClientView } from './pages/ClientView';
import { Edicion } from './components/Edicion';
import { Listado } from './components/Listado';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carrito } from './pages/Carrito';
import { Envio } from './pages/Envio';
import './App.css';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Login from './pages/login';
import HistorialCompras from './pages/historialcompras';
import {DataCliente} from './pages/DataCliente'
import { AuthProvider, useAuth } from './components/AuthenticationContext';

// Componente para rutas solo de Admin
const AdminRoute = ({ children }) => {
    const { isStaff, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>; // O un spinner de carga
    }

    if (!isStaff) {
        console.warn("Intento de acceso a ruta admin sin permisos.");
        return <Navigate to="/" replace />; // Redirige si no es staff/admin
    }

    return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PayPalScriptProvider options={{ "client-id": 
          "AU0_-KUk48ey1OZO6-E6LtGWurwOqweHGaVjZ7O7Ko4nOVbD9aZ1g7kjBPN7qkpBJGZKxOv4nXDDFl3X" }}>
          
                   
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/producto/:id" element={<VisualProducto />} />              
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/InfoClient/" element={<InfoClient />} />
              <Route path="/history" element={<HistorialCompras />} />                                       
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/login" element={<Login />} />            
              <Route path="/envio" element={<Envio />} />
              <Route path="/datacliente" element={<DataCliente />} />
              <Route path="/" element={<ClientView />} />
              <Route
                path="/admin/create-producto"
                element={
                  <AdminRoute>
                    <CrearInvPedido />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/editar-producto/:id"
                element={
                  <AdminRoute>
                    <Edicion />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/inventario"
                element={
                  <AdminRoute>
                    <Listado />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/salida-stock/:id"
                element={
                  <AdminRoute>
                    <SalidaStock />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/entrada-stock/:id"
                element={
                  <AdminRoute>
                    <EntradaStock />
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