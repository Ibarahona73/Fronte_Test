/**
 * CONFIGURACIÓN DE POSTCSS
 * 
 * Este archivo contiene la configuración de PostCSS, una herramienta para transformar
 * CSS con plugins de JavaScript. PostCSS permite:
 * - Importar archivos CSS (@import)
 * - Procesar URLs en CSS
 * - Anidar selectores CSS
 * - Agregar prefijos automáticamente para compatibilidad con navegadores
 * 
 * Plugins configurados:
 * - postcss-import: Permite usar @import para incluir otros archivos CSS
 * - postcss-url: Procesa URLs en CSS (optimización de rutas)
 * - postcss-nested: Permite anidar selectores CSS (similar a Sass/SCSS)
 * - autoprefixer: Agrega automáticamente prefijos de navegador necesarios
 */

export default {
    // Configuración de plugins de PostCSS
    plugins: {
      // Plugin para procesar @import en CSS
      // Permite importar otros archivos CSS usando @import
      'postcss-import': {},
      
      // Plugin para procesar URLs en CSS
      // Optimiza y transforma URLs en archivos CSS
      'postcss-url': {},
      
      // Plugin para anidar selectores CSS
      // Permite escribir CSS anidado similar a Sass/SCSS
      'postcss-nested': {},
      
      // Plugin para agregar prefijos automáticamente
      // Agrega prefijos de navegador necesarios para compatibilidad
      'autoprefixer': {},
    }
  }
  