import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VisualProducto } from './pages/VisualProducto';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { Navigation } from './components/Navigation';
import { ClientView } from './pages/ClientView';
import { Edicion } from './components/Edicion';
import { Listado } from './components/Listado';
import { Carrito } from './pages/Carrito';
import { CartProvider } from './components/CartContext'; // Importa CartProvider
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<ClientView />} />
          <Route path="/producto/:id" element={<VisualProducto />} />
          <Route path="/inventario" element={<Listado />} />
          <Route path="/ventas-create" element={<CrearInvPedido />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/editar/:id" element={<Edicion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
