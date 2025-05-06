import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InventarioPedidos } from './pages/InventarioPedidos.jsx';
import { CrearInvPedido } from './pages/CrearInvPedido.jsx';
import { Navigation } from './components/Navigation.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/inventario" />} />
        
        {/* Rutas principales */}
        <Route path="/inventario" element={<InventarioPedidos />} />
        <Route path="/ventas-create" element={<CrearInvPedido />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;