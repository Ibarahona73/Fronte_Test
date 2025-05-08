// App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Listado } from './components/Listado';
import { CrearInvPedido } from './pages/CrearInvPedido';
import { Navigation } from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/inventario" />} />
        <Route path="/inventario" element={<Listado />} />
        <Route path="/ventas-create" element={<CrearInvPedido />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
