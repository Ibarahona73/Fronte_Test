import axios from 'axios';

const api = axios.create({
    baseURL: 'https://tiendaonline-backend-yaoo.onrender.com', // URL base del backend
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

export const getPedidos = () => {
    return api.get('/api/v1/pedidos/')  // Asegúrate de que esta ruta coincida con tu backend
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching tareas:', error);
        throw error; // Propaga el error para manejarlo en el componente
      });
    }

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

export const updateProducto = (id, data) => {
    return api.put(`/api/v1/productos/${id}/`, data)  // Asegúrate de que esta ruta coincida con tu backend
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating tarea:', error);
        throw error; // Propaga el error para manejarlo en el componente
      });
    }

    export const deleteTarea = (id) => {
      return api.delete(`/api/v1/productos/${id}/`)  // Asegúrate de que esta ruta coincida con tu backend
        .then(response => response.data)
        .catch(error => {
          console.error('Error deleting tarea:', error);
          throw error; // Propaga el error para manejarlo en el componente
        });
    }
    