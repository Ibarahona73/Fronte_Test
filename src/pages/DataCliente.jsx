import FormDir from '../components/Formdir';
import React, { useState, useEffect } from 'react';
import 'react-phone-number-input/style.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthenticationContext';
import { getProfile } from '../api/datos.api';
import Swal from 'sweetalert2';

/**
 * Componente DataCliente - Gestiona la visualización y edición de los datos del cliente
 * 
 * Mejoras implementadas:
 * - Mapeo de nombres de país a IDs para el backend
 * - Mejor manejo de errores con detalles específicos
 * - Estado de carga durante las peticiones
 * - Validación mejorada de campos
 */
export function DataCliente() {
    // Contexto y hooks
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados del componente
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado para carga
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        city: '',
        country: '',
        state: '',
        zip: '',
        phone: '',
    });

    /**
     * Función para mapear nombres de país a IDs (simulada)
     * @param {string} countryName - Nombre del país seleccionado
     * @returns {number} - ID del país según backend
     */
    const getCountryId = (countryName) => {
        // Mapeo de ejemplo - debe coincidir con tu base de datos
        const countryMap = {
            'Honduras': 1,
            'Guatemala': 2,
            'El Salvador': 3,
            'Nicaragua': 4,
            'Costa Rica': 5,
            'Estados Unidos': 6,
            'México': 7,
            'España': 8
        };
        console.log('getCountryId - countryName:', countryName); // Debug
        console.log('getCountryId - countryMap keys:', Object.keys(countryMap)); // Debug
        const result = countryMap[countryName] || null;
        console.log('getCountryId - result:', result); // Debug
        return result;
    };

    // Mapeo de IDs a nombres
    const getCountryNameById = (countryId) => {
        const countryMap = {
            1: 'Honduras',
            2: 'Guatemala',
            3: 'El Salvador',
            4: 'Nicaragua',
            5: 'Costa Rica',
            6: 'Estados Unidos',
            7: 'México',
            8: 'España'
        };
        return countryMap[countryId] || '';
    };

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                try {
                    const userData = {
                        firstName: user.nombre_cliente || '',
                        lastName: user.apellido_cliente || '',             
                        address: user.direccion || '',
                        city: user.ciudad || '',
                        country: getCountryNameById(user.pais) || '',
                        state: user.estado_pais || '',
                        zip: user.zip || '',
                        phone: user.telefono || '',
                    };
                    setFormData(userData);
                    setIsEditing(false);
                } catch (error) {
                    console.error('Error al cargar datos del usuario:', error);
                }
            }
        };
        
        loadUserData();
    }, [user]);

    // Manejar cambio de teléfono
    const handlePhoneChange = (value) => {
        setFormData(prev => ({ ...prev, phone: value }));
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            console.log('formData.country:', formData.country); // Debug
            
            // Validación mejorada
            if (!formData.country) {
                throw new Error('El país es requerido');
            }
            
            // Convertir nombre de país a ID para el backend
            const countryId = getCountryId(formData.country);
            console.log('countryId obtenido:', countryId); // Debug
            
            if (!countryId) {
                throw new Error(`País seleccionado no válido: ${formData.country}`);
            }

            // Preparar datos para el backend
            const userData = {
                nombre_cliente: formData.firstName,
                apellido_cliente: formData.lastName,
                direccion: formData.address,
                ciudad: formData.city,
                pais: countryId,
                estado_pais: formData.state,
                zip: formData.zip,
                telefono: formData.phone
            };
            
            console.log('Datos a enviar:', userData); // Para debug

            // Llamada a la API con manejo de errores mejorado
            const response = await getProfile(userData);

            if (response) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Datos actualizados correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                setIsEditing(false);
                navigate('/ClientView');
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            
            // Manejo detallado de errores
            let errorMessage = 'Error al actualizar los datos. Por favor, intente nuevamente.';
            
            if (error.response?.data) {
                // Procesar errores específicos del backend
                if (typeof error.response.data === 'object') {
                    errorMessage = Object.entries(error.response.data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                } else {
                    errorMessage = error.response.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                footer: 'Por favor verifique los datos e intente nuevamente'
            });
        } finally {
            setIsLoading(false); // Desactivar estado de carga siempre
        }
    };

    // Habilita el modo edición
    const handleEditClick = () => {
        setIsEditing(true);
    };

    return (
        <div className="container mt-4">
            <h2>Dirección del Cliente</h2>
            
            {/* Formulario de dirección */}
            <FormDir
                formData={formData}
                onChange={setFormData}
                onPhoneChange={handlePhoneChange}
                onSubmit={handleSubmit}
                showEmail={false}
                showResumen={false}
                disableNameFields={true}
                showCompany={false}
                isUpdating={!isEditing}
            />
            
            {/* Botones de acción con estado de carga */}
            <div className="d-flex gap-2 mt-2">
                <button
                    className="btn btn-secondary col-md-2"
                    onClick={() => navigate('/ClientView')}
                    disabled={isLoading}
                >
                    &lt; Regresar
                </button>
                
                {!isEditing && (
                    <button
                        className="btn btn-primary col-md-2"
                        onClick={handleEditClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="visually-hidden">Cargando...</span>
                            </>
                        ) : 'Editar'}
                    </button>
                )}
            </div>
        </div>
    );
}