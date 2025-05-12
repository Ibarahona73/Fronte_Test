// App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VisualProducto } from './pages/VisualProducto';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { Navigation } from './components/Navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ClientView } from './pages/ClientView';
import { Edicion } from './components/Edicion';
import { Listado } from './components/Listado';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<ClientView/>} />
        <Route path="/inventario" element={<Listado />} />
        <Route path="/ventas-create" element={<CrearInvPedido />} />
        <Route path="/editar/:id" element={<Edicion />} />
        <Route path="/producto/:id" element={<VisualProducto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
