import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VisualProducto } from './pages/VisualProducto';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { CartProvider } from './components/CartContext'; // Importa CartProvider
import { Navigation } from './components/Navigation';
import { SalidaStock } from './pages/SalidaStock';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ClientView } from './pages/ClientView';
import { Edicion } from './components/Edicion';
import { Listado } from './components/Listado';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carrito } from './pages/Carrito';

import './App.css';
import { EntradaStock } from './pages/EntradaStock';


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<ClientView />} />
          <Route path="/producto/:id" element={<VisualProducto />} />
          <Route path="/inventario" element={<Listado />} />
          <Route path="/crearprod" element={<CrearInvPedido />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/editar/:id" element={<Edicion />} />
          <Route path="/out/:id" element={<SalidaStock />} />
          <Route path="/fillProd/:id" element={<EntradaStock />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
