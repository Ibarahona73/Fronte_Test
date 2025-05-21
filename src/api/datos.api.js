import axios from 'axios';

const api = axios.create({
    baseURL: 'https://tiendaonline-backend-yaoo.onrender.com', // URL base del backend
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });


      export const createProducto = async (formData) => {
        try {
            console.log("Datos enviados al backend:", formData);
            const response = await api.post('/api/v1/productos/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
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

export const getProductos = () => {
    return api.get('/api/v1/productos/')  // Asegúrate de que esta ruta coincida con tu backend
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching tareas:', error);
        throw error; // Propaga el error para manejarlo en el component e
      });
    }

export const getProducto = (id) => {
    return api.get(`/api/v1/productos/${id}/`)  // Asegúrate de que esta ruta coincida con tu backend
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching tarea:', error);
        throw error; // Propaga el error para manejarlo en el componente
      });
    }

export const updateProducto = async (id, data) => {
    try {
        let payload = data;
        let contentType = 'application/json';

        if (data.imagen) {
            payload = new FormData();
             for (const key in data) {
                payload.append(key, data[key]);
            }
            contentType = 'multipart/form-data';
        }

        const response = await api.put(`/api/v1/productos/${id}/`, payload, {
            headers: {
                'Content-Type': data.imagen ? 'multipart/form-data' : 'application/json',
                ...getAuthHeaders()
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating producto:', error);
        throw error.response?.data || error;
    }
};

    export const deleteProducto = (id) => {
      return api.delete(`/api/v1/productos/${id}/`, {
          headers: getAuthHeaders()
        })
        .then(response => response.data)
        .catch(error => {
          console.error('Error deleting tarea:', error);
          throw error.response?.data || error;
        });
    }

//quitar productos del stock
export async function updateProductoStock(id, cantidad) {
    try {
        const response = await api.put(`/api/v1/productos/${id}/cantidad_en_stock/${cantidad}/`);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el stock del producto:', error);
        throw error;
    }
}

// Añadir productos al stock
export async function addProductoStock(id, cantidad) {
  try {
      const response = await api.put(`/api/v1/productos/${id}/cantidad_en_stock/${cantidad}/`);
      return response.data;
  } catch (error) {
      console.error('Error al actualizar el stock del producto:', error);
      throw error;
  }
}




//Pedidos

export const createPedido = async (formData) => {
    try {
        console.log("Sending to backend:", formData);
        const response = await api.post('/api/v1/pedidos/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Full error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else {
            console.error('Error without response:', error);
        }
        throw error;
    }
};

export const getPedidos = () => {
    return api.get('/api/v1/pedidos/')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching pedidos:', error);
            throw error;
        });
};

export const getPedido = (id) => {
    return api.get(`/api/v1/pedidos/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching pedido:', error);
            throw error;
        });
};

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

export const deletePedido = (id) => {
    return api.delete(`/api/v1/pedidos/${id}/`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error deleting pedido:', error);
            throw error;
        });
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/login/', { email, password });
        // Guarda el token en localStorage
        localStorage.setItem('token', response.data.token);
        // **CORRECCIÓN:** Guarda el objeto completo del usuario, asumiendo que viene en response.data.user
        // Asegúrate de que la respuesta del backend en /login/ incluya 'user' con campos como id, email, is_staff, is_superuser, etc.
       
        if (response.data.user) {
            localStorage.setItem('usuario', JSON.stringify(response.data.user));
            return response.data;
        } else {
            return;
        }
        // Devuelve la respuesta completa, que debería incluir token y user
    } catch (error) {
        console.error("Error en loginUser:", error.response?.data || error);
        throw error.response?.data || error; // Propaga el error con detalles
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/register/', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Token ${token}` } : {};
}

// Ejemplo de uso en un endpoint protegido:
export const getProfile = async () => {
    try {
        const response = await api.post('/profile/', {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

    