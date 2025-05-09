import axios from 'axios';

// Función para asegurar URLs HTTPS
const secureUrl = (url) => {
  if (!url) return url;
  return url.replace(/^http:\/\//i, 'https://');
};

const api = axios.create({
  baseURL: 'https://tiendaonline-backend-yaoo.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para forzar HTTPS en todas las respuestas
api.interceptors.response.use(response => {
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(item => {
      if (item.imagen) {
        return {
          ...item,
          imagen: secureUrl(item.imagen)
        };
      }
      return item;
    });
  }
  return response;
}, error => {
  return Promise.reject(error);
});

export const getPedidos = () => {
  return api.get('/api/v1/pedidos/')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching pedidos:', error);
      throw error;
    });
};

export const createProducto = async (formData) => {
  try {
    const response = await api.post('/api/v1/productos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

export const getProductos = () => {
  return api.get('/api/v1/productos/')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching productos:', error);
      throw error;
    });
};

export const getProducto = (id) => {
  return api.get(`/api/v1/productos/${id}/`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching producto:', error);
      throw error;
    });
};

export const updateProducto = (id, data) => {
  return api.put(`/api/v1/productos/${id}/`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating producto:', error);
      throw error;
    });
};

export const deleteProducto = (id) => {
  return api.delete(`/api/v1/productos/${id}/`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting producto:', error);
      throw error;
    });
};