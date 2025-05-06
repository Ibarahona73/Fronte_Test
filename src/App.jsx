import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import { InventarioPedidos } from './Pages/InventarioPedidos/'; /**Despliegue de datos */
import { CrearInvPedido } from './Pages/CrearInvPedido/'; /**Formulario Crear */
import { Navigation } from './components/Navigation'; /**Menu de Navegacion */

function App(){
  return (
    <BrowserRouter>
      <Navigation/>
      <Routes>        
	      <Route path="/" element={<Navigate to="/inventario"/>}/> 
        <Route path="/inventario" element={<InventarioPedidos/>}/>       /**Despliegue de datos */
        <Route path="/VentasCreate" element={<CrearInvPedido/>}/>       /**Formulario Crear */
      </Routes>    
    </BrowserRouter>
  );
} 
export default App
