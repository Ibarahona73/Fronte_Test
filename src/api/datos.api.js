import axios from 'axios';

const api = axios.create({
    baseURL: 'https://tiendaonline-backend-yaoo.onrender.com',
    headers: {
        'Accept': 'application/json',
    },
});

// Función para crear producto con manejo de FormData
export const createProducto = async (formData) => {
    try {
        console.log('[API] Enviando datos del producto:', formData);

        const response = await api.post('/api/v1/productos/', formData);
        console.log('[API] Producto creado exitosamente:', response.data);
        return response;
    } catch (error) {
        console.error('[API] Error al crear producto:', {
            message: error.message,
            code: error.code,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            } : 'No hay respuesta del servidor',
            request: error.request ? 'Request fue enviado' : 'Request no fue enviado'
        });
        throw error;
    }
};

// Función para obtener productos
export const getProductos = async () => {
    try {
        const response = await api.get('/api/v1/productos/');
        return response.data;
    } catch (error) {
        console.error('[API] Error al obtener productos:', error);
        throw error;
    }
};

// Función para obtener un producto específico
export const getProducto = async (id) => {
    try {
        const response = await api.get(`/api/v1/productos/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`[API] Error al obtener producto ${id}:`, error);
        throw error;
    }
};

// Función para actualizar producto
export const updateProducto = async (id, data) => {
    try {
        console.log(`[API] Actualizando producto ${id}:`, data);
        
        // Si data contiene imagen, usar FormData
        let requestData = data;
        if (data.imagen) {
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            requestData = formData;
        }

        const response = await api.put(`/api/v1/productos/${id}/`, requestData);
        return response.data;
    } catch (error) {
        console.error(`[API] Error al actualizar producto ${id}:`, error);
        throw error;
    }
};

// Función para eliminar producto
export const deleteProducto = async (id) => {
    try {
        const response = await api.delete(`/api/v1/productos/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`[API] Error al eliminar producto ${id}:`, error);
        throw error;
    }
};

// Funciones para pedidos
export const getPedidos = async () => {
    try {
        const response = await api.get('/api/v1/pedidos/');
        return response.data;
    } catch (error) {
        console.error('[API] Error al obtener pedidos:', error);
        throw error;
    }
};