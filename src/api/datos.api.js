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
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
         }  catch (error) {
          if (error.response) {
            console.error('Error response data:', error.response.data);
          }
          throw error;
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

        // Si los datos incluyen un archivo, usar FormData
        if (data.imagen) {
            payload = new FormData();
            for (const key in data) {
                payload.append(key, data[key]);
            }
        }

        const response = await api.put(`/api/v1/productos/${id}/`, payload, {
            headers: {
                'Content-Type': data.imagen ? 'multipart/form-data' : 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating producto:', error);
        throw error;
    }
};

    export const deleteProducto = (id) => {
      return api.delete(`/api/v1/productos/${id}/`)  // Asegúrate de que esta ruta coincida con tu backend
        .then(response => response.data)
        .catch(error => {
          console.error('Error deleting tarea:', error);
          throw error; // Propaga el error para manejarlo en el componente
        });
    }

//Pedidos

export const createPedido = async (formData) => {
    try {
        console.log("Datos enviados al backend:", formData);
        const response = await api.post('/api/v1/pedidos/', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
     }  catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

export const getPedidos = () => {
  return api.get('/api/v1/pedidos/')  // Asegúrate de que esta ruta coincida con tu backend
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching tareas:', error);
      throw error; // Propaga el error para manejarlo en el componente
    });
  }
