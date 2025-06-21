import axios from 'axios';

/**
 * CONFIGURACIÓN BASE DE AXIOS
 * Crea una instancia de axios con configuración predeterminada para todas las peticiones
 */
const api = axios.create({
    baseURL: 'https://tiendaonline-backend-yaoo.onrender.com', // URL base del backend
    headers: {
      'Content-Type': 'application/json', // Tipo de contenido por defecto
      'Accept': 'application/json', // Aceptar respuestas en JSON
    },
    withCredentials: false // Deshabilitado para evitar problemas de CORS
});

/**
 * Función para verificar si el token de autenticación existe en localStorage
 * @returns {boolean} True si existe token, False si no
 */
const isTokenValid = () => {
    const token = localStorage.getItem('token');
    return !!token; // Convierte a booleano
};

/**
 * INTERCEPTOR DE REQUEST
 * Se ejecuta antes de cada petición para agregar el token de autenticación
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Agrega el token al header Authorization en formato "Token {token}"
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Error en la configuración de la petición:', error);
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTOR DE RESPONSE
 * Se ejecuta para cada respuesta y maneja errores globales como 401/403
 */
api.interceptors.response.use(
    (response) => response, // Si es exitosa, pasa la respuesta
    (error) => {
        console.error('Error en la respuesta:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });
        
        // Si el error es de autenticación (401) o permisos (403)
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Limpiar datos de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Redirigir a login si no está ya en esa página
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * FUNCIONES PARA PRODUCTOS
 */

/**
 * Obtiene todos los productos
 * @returns {Promise} Lista de productos
 */
export const getProductos = () => {
    return api.get('/api/v1/productos/')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching productos:', error);
        throw error;
      });
}

/**
 * Obtiene un producto específico por ID
 * @param {number} id - ID del producto
 * @returns {Promise} Datos del producto
 */
export const getProducto = (id) => {
    return api.get(`/api/v1/productos/${id}/`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching producto:', error);
        throw error;
      });
}


/**
 * Crea un nuevo producto
 * @param {FormData} formData - Datos del producto (puede incluir imagen)
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const createProducto = async (formData) => {
    try {
        console.log("Datos enviados al backend:", formData);
        const response = await api.post('/api/v1/productos/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Para enviar archivos
                ...getAuthHeaders() // Agrega headers de autenticación

            }
        });
        return response.data;
     }  catch (error) {
      console.error('Full error response:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  };


/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto a actualizar
 * @param {Object} data - Nuevos datos del producto
 * @returns {Promise} Producto actualizado
 */
export const updateProducto = async (id, data) => {
    try {
        let payload = data;
        const headers = getAuthHeaders();
         // Obtenemos solo el header de autorización

        // Si hay una imagen, creamos FormData y dejamos que Axios maneje el Content-Type
        if (data.imagen) {
            payload = new FormData();
             for (const key in data) {
                if (data[key] !== null && data[key] !== undefined) {
                    payload.append(key, data[key]);
                }
            }
        } else {
            // Si no hay imagen, es una petición JSON
            //
            console.log(headers)
        }

        const response = await api.put(`/api/v1/productos/${id}/`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data', // Para enviar archivos
                ...getAuthHeaders() // Agrega headers de autenticación
    }});

        return response.data;
    } catch (error) {
        console.error('Error updating producto:', error);
        throw error.response?.data || error;
    }
};

/**
 * Elimina un producto
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise} Respuesta del servidor
 */
export const deleteProducto = (id) => {
    return api.delete(`/api/v1/productos/${id}/`, {
          headers: getAuthHeaders()
        })
        .then(response => response.data)
        .catch(error => {
          console.error('Error deleting producto:', error);
          throw error.response?.data || error;
        });
}

/**
 * Actualiza el stock de un producto (reducción)
 * @param {number} id - ID del producto
 * @param {number} cantidad - Cantidad a reducir
 * @returns {Promise} Respuesta del servidor
 */
export async function updateProductoStock(id, cantidad) {
    try {
        const response = await api.put(`/api/v1/productos/${id}/actualizar_cantidad_en_stock/?cantidad=${cantidad}`);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el stock del producto:', error);
        throw error;
    }
}

/**
 * Aumenta el stock de un producto
 * @param {number} id - ID del producto
 * @param {number} cantidad - Cantidad a aumentar
 * @returns {Promise} Respuesta del servidor
 */
export async function addProductoStock(id, cantidad) {
  try {
      const response = await api.put(`/api/v1/productos/${id}/agregar_en_stock/?cantidad=${cantidad}`);
      return response.data;
  } catch (error) {
      console.error('Error al actualizar el stock del producto:', error);
      throw error;
  }
}

/**
 * FUNCIONES PARA PEDIDOS
 */

/**
 * Crea un nuevo pedido
 * @param {Object} pedidoData - Datos del pedido
 * @returns {Promise} Pedido creado
 */
export const createPedido = async (pedidoData) => {
    try {
        console.log("Datos a enviar al backend:", pedidoData);

        const response = await api.post('/api/v1/pedidos/', pedidoData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error completo:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else {
            console.error('Error sin respuesta:', error);
        }
        throw error;
    }
};

/**
 * Obtiene todos los pedidos
 * @returns {Promise} Lista de pedidos
 */
export const getPedidos = () => {
    return api.get('/api/v1/pedidos/')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching pedidos:', error);
            throw error;
        });
};

/**
 * Obtiene un pedido específico por ID
 * @param {number} id - ID del pedido
 * @returns {Promise} Datos del pedido
 */
export const getPedido = (id) => {
    return api.get(`/api/v1/pedidos/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching pedido:', error);
            throw error;
        });
};

/**
 * Actualiza un pedido existente
 * @param {number} id - ID del pedido
 * @param {Object} data - Nuevos datos del pedido
 * @returns {Promise} Pedido actualizado
 */
export const updatePedido = async (id, data) => {
    try {
        const response = await api.put(`/api/v1/pedidos/${id}/`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating pedido:', error);
        throw error;
    }
};

/**
 * Elimina un pedido
 * @param {number} id - ID del pedido a eliminar
 * @returns {Promise} Respuesta del servidor
 */
export const deletePedido = (id) => {
    return api.delete(`/api/v1/pedidos/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error deleting pedido:', error);
            throw error;
        });
};

/**
 * FUNCIONES PARA AUTENTICACIÓN Y USUARIOS
 */

/**
 * Inicia sesión de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} Datos del usuario y token
 */
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/login/', { email, password });
        if (response.data.token) {
            // Almacena el token con prefijo 'Token'
            const token = `Token ${response.data.token}`;
            localStorage.setItem('token', token);
            
            // Guarda datos del usuario si vienen en la respuesta
            if (response.data.user) {
                localStorage.setItem('usuario', JSON.stringify(response.data.user));
            }
            
            // Configura el token para futuras peticiones
            api.defaults.headers.common['Authorization'] = token;
            return response.data;
        }
        throw new Error('No se recibió token en la respuesta');
    } catch (error) {
        console.error("Error en loginUser:", error.response?.data || error);
        throw error.response?.data || error;
    }
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del nuevo usuario
 * @returns {Promise} Respuesta del servidor
 */
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/register/', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtiene los headers de autenticación
 * @returns {Object} Headers con token de autorización
 * @throws {Error} Si no hay token
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    return {
        'Authorization': `Token ${token}`
    };
}

/**
 * Actualiza el perfil del usuario
 * @param {Object} userData - Nuevos datos del usuario
 * @returns {Promise} Perfil actualizado
 */
export const getProfile = async (userData) => {
    try {
        const response = await api.put('/profile/', userData, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        
        // Actualiza localStorage con nuevos datos
        if (response.data) {
            localStorage.setItem('usuario', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error('Error en getProfile:', {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });
        
        const apiError = new Error(error.response?.data?.message || 'Error al actualizar perfil');
        apiError.response = error.response;
        throw apiError;
    }
};

/**
 * FUNCIONES PARA MOVIMIENTOS DE INVENTARIO
 */

/**
 * Registra una salida de stock
 * @param {Object} movimientoData - Datos del movimiento
 * @returns {Promise} Respuesta del servidor
 */
export const registrarSalidaStock = async (movimientoData) => {
    try {
        const response = await api.post('/movimientos/', movimientoData);
        return response.data;
    } catch (error) {
        console.error('Error al registrar salida:', error);
        throw error.response?.data || error;
    }
};

/**
 * FUNCIONES PARA DETALLES DE PEDIDOS
 */

/**
 * Obtiene todos los detalles de pedidos
 * @returns {Promise} Lista de detalles
 */
export const getPedidoDetalles = () => {
    return api.get('/api/v1/detalles-pedido/')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching detalles-pedido:', error);
            throw error;
        });
};

/**
 * Obtiene un detalle de pedido específico
 * @param {number} id - ID del detalle
 * @returns {Promise} Detalle del pedido
 */
export const getPedidoDetalle = (id) => {
    return api.get(`/api/v1/detalles-pedido/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching pedido:', error);
            throw error;
        });
};

/**
 * FUNCIONES PARA USUARIOS
 */

/**
 * Obtiene todos los usuarios
 * @returns {Promise} Lista de usuarios
 */
export const getUsuarios = () => {
    return api.get('/api/v1/usuarios/')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching usuarios:', error);
            throw error;
        });
};

/**
 * Obtiene un usuario específico
 * @param {number} id - ID del usuario
 * @returns {Promise} Datos del usuario
 */
export const getUsuario = (id) => {
    return api.get(`/api/v1/usuarios/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching usuario:', error);
            throw error;
        });
};

/**
 * FUNCIONES PARA EL CARRITO DE COMPRAS
 */

/**
 * Obtiene el carrito del usuario actual con detalles completos de productos
 * @returns {Promise} Array con items del carrito
 */
export const getCarrito = async () => {
    const token = localStorage.getItem('token');
    // Si no hay token válido, retorna array vacío
    if (!token || !isTokenValid()) {
        return Promise.resolve([]);
    }
    
    try {
        const response = await api.get(`/api/v1/carrito/`);
        const carritoData = response.data;
        
        // Obtiene detalles completos de cada producto en el carrito
        const carritoConProductos = await Promise.all(
            carritoData.map(async (item) => {
                try {
                     const productoResponse = await getProducto(item.producto);
                    //const productoResponse = await api.get(`/api/v1/carrito/`);
                    return {
                        ...item,
                        producto: productoResponse,
                        cantidad_temp: item.cantidad,
                        
                    };
                } catch (error) {
                    console.error(`Error al obtener detalles del producto ${item.producto}:`, error);
                    return item;
                }
            })
        );
        
        return carritoConProductos;
    } catch (error) {
        console.error('Error fetching carrito:', error);
        return [];
    }
};

/**
 * Agrega un producto al carrito
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad a agregar
 * @returns {Promise} Respuesta del servidor
 * @throws {Error} Si no hay sesión activa o hay errores de validación
 */
export const addToCarrito = async (productoId, cantidad) => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    // Verifica sesión activa
    if (!token || !usuario) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito');
    }

    try {
        console.log('Token utilizado:', token);
        // Obtiene ID del usuario
        const usuarioData = JSON.parse(usuario);
        const usuarioId = usuarioData.id;

        console.log('Datos enviados:', { producto: productoId, cantidad_prod: cantidad, usuario: usuarioId });

        // Configura headers
        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Realiza petición
        const response = await api.post(`/api/v1/carrito/`, {
            producto: productoId,
            cantidad_prod: cantidad,
            usuario: usuarioId,
            actualizar_stock: false // No actualiza stock todavía
        }, {
            headers,
            withCredentials: false
        });

        console.log('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error detallado en addToCarrito:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });

        // Maneja errores específicos
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.response?.status === 400) {
            const errorData = error.response?.data;
            let errorMessage = 'Error al agregar producto al carrito.';
            if (errorData) {
                errorMessage = Object.entries(errorData)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return `${field}: ${messages.join(', ')}`;
                        } else {
                            return `${field}: ${messages}`;
                        }
                    })
                    .join('; ');
            }
            throw new Error(errorMessage);
        }
        throw error.response?.data || error;
    }
};

/**
 * Actualiza la cantidad de un item en el carrito
 * @param {number} carritoId - ID del item en carrito
 * @param {number} cantidad - Nueva cantidad
 * @returns {Promise} Respuesta del servidor
 */
export const updateCarritoItem = async (carritoId, cantidad) => {
    try {
        console.log('=== INICIO updateCarritoItem ===');
        console.log('Parámetros recibidos:', { carritoId, cantidad });

        // Validar que la cantidad sea mayor que 0
        if (cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        } //hay que borrarlo

        // Primero obtenemos el item actual del carrito para tener todos los datos necesarios
        const carritoItem = await api.get(`/api/v1/carrito/${carritoId}/`, {
            headers: getAuthHeaders()
        });

        console.log('Item actual del carrito:', carritoItem.data); /// esta es la cantidad buena

        // Calculamos la diferencia de cantidad
        const cantidadActual = carritoItem.data.cantidad_prod;
        const diferencia = cantidad - cantidadActual;

        console.log('Cálculos de cantidad:', {
            cantidad_nueva: cantidad,
            cantidad_actual: cantidadActual,
            diferencia: diferencia
        });

        // Actualizamos la cantidad en el carrito
        const response = await api.put(
            `/api/v1/carrito/${carritoId}/`,
            {
                usuario: carritoItem.data.usuario,
                producto: carritoItem.data.producto,
                cantidad_prod: cantidad,                
                fecha_creacion: carritoItem.data.fecha_creacion,
                fecha_actualizacion: new Date().toISOString(),
                expirado: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            }
        );

        console.log('Respuesta del servidor:', response.data);

        // Si la actualización fue exitosa, actualizamos el stock del producto
        // if (response.status === 200) {
        //     // Actualizamos el stock del producto con la diferencia
        //     if (carritoItem.data.producto) {
        //         // La diferencia debe ser negativa para reducir el stock
        //         const stockDiferencia = -diferencia;
                
        //         console.log("Diferencia de stock:", stockDiferencia);
                
        //         await api.put(
        //             `/api/v1/productos/${carritoItem.data.producto}/actualizar_cantidad_en_stock/?cantidad=${stockDiferencia}`,
        //             {},
        //             {
        //                 headers: getAuthHeaders()
        //             }
        //         );
        //     }
        // }//esta malo no entendes!!!

        return response.data;
    } catch (error) {
        console.error('Error detallado:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });

        if (error.response?.status === 404) {
            throw new Error('El producto ya no está disponible en el carrito');
        } else if (error.response?.status === 400) {
            const errorMessage = error.response.data.message || error.response.data.detail || 'Error al actualizar la cantidad';
            throw new Error(errorMessage);
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error al actualizar la cantidad: ${error.message}`);
    }
};

/**
 * Elimina un item del carrito
 * @param {number} carritoId - ID del item a eliminar
 * @returns {Promise} Respuesta del servidor
 */
export const removeFromCarrito = async (carritoId) => {
    try {
        console.log(`[Carrito] Iniciando eliminación del ítem ${carritoId}`);
        
        const response = await api.delete(
            `/api/v1/carrito/${carritoId}/`,
            {
                headers: getAuthHeaders()
            }
        );
        
        console.log(`[Carrito] Ítem ${carritoId} eliminado correctamente`);
        return response.data;
    } catch (error) {
        console.error('[Carrito] Error al eliminar:', {
            id: carritoId,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response?.status === 404) {
            throw new Error('El ítem ya no existe en el carrito');
        }
        throw error;
    }
};

/**
 * Verifica el estado del carrito (productos expirados, etc.)
 * @returns {Promise} Objeto con información de productos expirados
 */
export const verificarCarrito = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid()) {
        return Promise.resolve({ productos_expirados: [] });
    }

    try {
        const response = await api.get('/api/v1/carrito/verificar_expiracion/', {
            headers: getAuthHeaders()
        });
        
        // Solo mostrar alerta si realmente hay productos expirados
        if (response.data && response.data.productos_expirados && response.data.productos_expirados.length > 0) {
            // Filtrar solo los productos realmente expirados
            const productosRealmenteExpirados = response.data.productos_expirados.filter(
                producto => producto.motivo === 'expirado_por_tiempo' || producto.motivo === 'sin_stock_o_producto_no_existe'
            );
            
            if (productosRealmenteExpirados.length > 0) {
                console.log('Productos realmente expirados detectados:', productosRealmenteExpirados);
            }
        }
        
        return response.data;
    } catch (error) {
        console.error('Error al verificar expiración del carrito:', error);
        // Si hay error, devolver un objeto vacío para evitar romper la aplicación
        return { productos_expirados: [] };
    }
};

/**
 * Vacía completamente el carrito del usuario
 * @returns {Promise} Respuesta del servidor
 */
export const limpiarCarrito = async () => {
    try {
        const response = await api.delete(`/api/v1/carrito/limpiar-carrito/`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error al limpiar el carrito:', error);
        throw error;
    }
};