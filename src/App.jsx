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


function App() {
  return (
    <CartProvider>
      <PayPalScriptProvider options={{ "client-id": 
        "AU0_-KUk48ey1OZO6-E6LtGWurwOqweHGaVjZ7O7Ko4nOVbD9aZ1g7kjBPN7qkpBJGZKxOv4nXDDFl3X" }}>
          
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/producto/:id" element={<VisualProducto />} />
            <Route path="/fillProd/:id" element={<EntradaStock />} />
            <Route path="/crearprod" element={<CrearInvPedido />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/InfoClient/" element={<InfoClient />} />
            <Route path="/history" element={<HistorialCompras />} />
            <Route path="/out/:id" element={<SalidaStock />} />
            <Route path="/editar/:id" element={<Edicion />} />
            <Route path="/inventario" element={<Listado />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />            
            <Route path="/envio" element={<Envio />} />
            <Route path="/datacliente" element={<DataCliente />} />
            <Route path="/" element={<ClientView />} />
          </Routes>
        </BrowserRouter>
      </PayPalScriptProvider>
    </CartProvider>
  );
}

export default App;