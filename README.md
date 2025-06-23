# 🛒 Tienda Online - Frontend

## 📋 Descripción del Proyecto

Este es el frontend de una aplicación de tienda online desarrollada con React. La aplicación permite a los usuarios navegar por productos, agregarlos al carrito, realizar compras y gestionar su cuenta. También incluye un panel administrativo para gestionar inventario y pedidos.

## 🚀 Tecnologías Utilizadas

### Frontend Principal
- **React 19.1.0** - Biblioteca principal para la interfaz de usuario
- **React Router DOM 7.5.3** - Enrutamiento de la aplicación
- **Vite 6.3.1** - Bundler y servidor de desarrollo

### Estilos y UI
- **Bootstrap 5.3.6** - Framework CSS para diseño responsive
- **Bootstrap Icons 1.12.1** - Iconografía
- **PostCSS** - Procesamiento de CSS con plugins:
  - `postcss-import` - Importación de archivos CSS
  - `postcss-url` - Procesamiento de URLs
  - `postcss-nested` - Anidamiento de selectores CSS
  - `autoprefixer` - Prefijos automáticos para navegadores

### Funcionalidades Específicas
- **React Hook Form 7.56.2** - Manejo de formularios
- **React Hot Toast 2.5.2** - Notificaciones
- **React Phone Number Input 3.4.12** - Input para números telefónicos
- **React Slick 0.30.3** - Carruseles de productos
- **Slick Carousel 1.8.1** - Estilos para carruseles

### Pagos y Comunicación
- **PayPal React JS 8.8.3** - Integración con PayPal
- **Pusher JS 8.4.0** - Comunicación en tiempo real

### Utilidades
- **Axios 1.9.0** - Cliente HTTP para API
- **SweetAlert2 11.21.0** - Alertas y modales
- **Popper.js 2.11.8** - Posicionamiento de elementos

### Desarrollo
- **ESLint 9.22.0** - Linting de código
- **TypeScript Types** - Tipos para React y React DOM

## 📁 Estructura del Proyecto

```
client/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── CartContext.jsx  # Contexto del carrito de compras
│   │   ├── AuthenticationContext.jsx  # Contexto de autenticación
│   │   ├── Navigation.jsx   # Barra de navegación
│   │   ├── ProductCarousel.jsx  # Carrusel de productos
│   │   ├── Card.jsx         # Tarjeta de producto
│   │   ├── Listado.jsx      # Lista de productos (admin)
│   │   ├── Edicion.jsx      # Edición de productos (admin)
│   │   ├── Formdir.jsx      # Formulario de dirección
│   │   └── ...
│   ├── pages/               # Páginas principales
│   │   ├── ClientView.jsx   # Vista principal del cliente
│   │   ├── VisualProducto.jsx  # Vista detallada de producto
│   │   ├── Carrito.jsx      # Página del carrito
│   │   ├── Envio.jsx        # Página de envío
│   │   ├── login.jsx        # Página de login
│   │   ├── CrearInvPedido.jsx  # Crear producto (admin)
│   │   ├── EntradaStock.jsx # Entrada de stock (admin)
│   │   ├── SalidaStock.jsx  # Salida de stock (admin)
│   │   └── ...
│   ├── api/                 # Servicios de API
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── dist/                    # Build de producción
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
├── postcss.config.js        # Configuración de PostCSS
├── netlify.toml             # Configuración de despliegue
└── README.md                # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd client
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   VITE_API_URL=http://localhost:8000
   VITE_PAYPAL_CLIENT_ID=tu_client_id_de_paypal
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🚀 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🔧 Configuración de Despliegue

### Netlify
El proyecto está configurado para desplegarse automáticamente en Netlify. La configuración se encuentra en `netlify.toml`:

```toml
[build]
publish = "dist"
command = "npm install && npm run build"
```

### Variables de Entorno en Producción
Asegúrate de configurar las siguientes variables de entorno en tu plataforma de despliegue:
- `VITE_API_URL` - URL de tu API backend
- `VITE_PAYPAL_CLIENT_ID` - Client ID de PayPal

## 🏗️ Arquitectura de la Aplicación

### Contextos Globales

#### CartContext
Maneja toda la lógica del carrito de compras:
- Agregar/eliminar productos
- Actualizar cantidades
- Verificar expiración de productos
- Sincronización en tiempo real con el backend

#### AuthenticationContext
Gestiona la autenticación de usuarios:
- Login/logout
- Verificación de permisos (staff/admin)
- Persistencia de sesión
- Control de acceso a rutas protegidas

### Sistema de Rutas

#### Rutas Públicas
- `/` - Vista principal del cliente
- `/producto/:id` - Vista detallada de producto
- `/carrito` - Carrito de compras
- `/login` - Página de login
- `/envio` - Página de envío
- `/history` - Historial de compras (redirección condicional)

#### Rutas Administrativas (Protegidas)
- `/admin/create-producto` - Crear nuevo producto
- `/admin/editar-producto/:id` - Editar producto existente
- `/admin/inventario` - Gestión de inventario
- `/admin/entrada-stock/:id` - Entrada de stock
- `/admin/salida-stock/:id` - Salida de stock
- `/admin/history` - Historial de compras (vista admin)

### Componentes Principales

#### Navigation
Barra de navegación principal que incluye:
- Enlaces de navegación
- Contador de productos en el carrito
- Menú desplegable de usuario
- Enlaces administrativos (solo para staff)

#### ProductCarousel
Carrusel de productos que utiliza React Slick para mostrar productos destacados.

#### Card
Componente reutilizable para mostrar información de productos en formato de tarjeta.

## 🔌 Integraciones

### PayPal
Integración completa con PayPal para procesamiento de pagos:
- Botones de PayPal
- Procesamiento de transacciones
- Manejo de respuestas de pago

### Comunicación en Tiempo Real
- **Pusher**: Para actualizaciones de stock en tiempo real

## 🎨 Estilos y Diseño

### Framework CSS
- **Bootstrap 5**: Sistema de grid, componentes y utilidades
- **Bootstrap Icons**: Iconografía consistente

### PostCSS
Procesamiento de CSS con plugins especializados:
- Anidamiento de selectores
- Importación de archivos CSS
- Prefijos automáticos
- Optimización de URLs

### Diseño Responsive
La aplicación está diseñada para funcionar en todos los dispositivos:
- Mobile-first approach
- Breakpoints de Bootstrap
- Componentes adaptativos

## 🔒 Seguridad

### Autenticación
- Tokens JWT para autenticación
- Verificación de permisos en el frontend
- Protección de rutas administrativas
- Manejo seguro de sesiones

### Validación
- Validación de formularios con React Hook Form
- Validación de datos en el frontend
- Sanitización de inputs

## 📱 Funcionalidades Principales

### Para Clientes
- Navegación por productos
- Agregar productos al carrito
- Gestionar cantidades en el carrito
- Proceso de checkout con PayPal
- Historial de compras
- Gestión de datos personales

### Para Administradores
- Gestión completa de inventario
- Crear y editar productos
- Control de stock (entrada/salida)
- Vista de historial de compras
- Panel administrativo protegido

## 🐛 Solución de Problemas

### Errores Comunes

#### Error de PostCSS
Si encuentras errores relacionados con PostCSS, asegúrate de que todas las dependencias estén instaladas:
```bash
npm install postcss-nested autoprefixer postcss-import postcss-url
```

#### Error de React Slick
Si hay problemas con los carruseles:
```bash
npm install react-slick slick-carousel
```

#### Error de Build en Netlify
Verifica que todas las dependencias estén en `package.json` y no en `devDependencies` si son necesarias en producción.

### Logs y Debugging
- Usa `console.log` para debugging (se eliminan en producción)
- Revisa la consola del navegador para errores
- Verifica los logs de Netlify para errores de build

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

👥 Autores

-Desarrollador Principal - [Ivan Barahona]

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
- Email: [igyt2015@gmail.com]
---

**Nota**: Este proyecto es parte de una aplicación completa de tienda online. Asegúrate de que el backend esté configurado y funcionando correctamente para que todas las funcionalidades trabajen como se espera.
