/**
 * PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN
 * 
 * Este archivo es el punto de entrada de la aplicación React.
 * Se encarga de:
 * - Renderizar el componente App en el DOM
 * - Importar los estilos globales (Bootstrap y Bootstrap Icons)
 * - Configurar React en modo estricto para detectar problemas
 */

// Importaciones de React y ReactDOM para el renderizado
import React from 'react'
import ReactDOM from 'react-dom/client'

// Importación del componente principal de la aplicación
import App from './App.jsx'

// Importación de estilos globales
import './index.css' // Estilos CSS personalizados de la aplicación
import 'bootstrap/dist/css/bootstrap.min.css'; // Framework CSS Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Iconos de Bootstrap

// Renderizado de la aplicación en el elemento con id 'root'
// React.StrictMode ayuda a detectar efectos secundarios y problemas en desarrollo
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
