/**
 * CONFIGURACIÓN DE VITE
 * 
 * Este archivo contiene la configuración del bundler Vite para la aplicación React.
 * Vite es una herramienta de construcción moderna que proporciona:
 * - Servidor de desarrollo ultra rápido
 * - Hot Module Replacement (HMR)
 * - Optimización de build para producción
 * - Soporte nativo para ES modules
 * 
 * Configuración actual:
 * - Plugin de React para JSX y optimizaciones específicas de React
 * - Configuración básica para desarrollo y producción
 */

// Importación de la función de configuración de Vite
import { defineConfig } from 'vite'

// Importación del plugin oficial de React para Vite
import react from '@vitejs/plugin-react'

// Configuración principal de Vite
// https://vitejs.dev/config/
export default defineConfig({
  // Array de plugins que se aplicarán durante el build
  plugins: [
    react() // Plugin de React - habilita JSX, Fast Refresh, optimizaciones
  ],
  
  // Nota: Se pueden agregar más configuraciones aquí como:
  // - server: { port: 3000 } // Puerto del servidor de desarrollo
  // - build: { outDir: 'dist' } // Directorio de salida
  // - resolve: { alias: { '@': '/src' } } // Alias de importaciones
  // - define: { 'process.env.NODE_ENV': '"production"' } // Variables de entorno
})
