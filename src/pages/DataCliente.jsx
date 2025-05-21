import FormDir from '../components/Formdir';
import React, { useState } from 'react';
import 'react-phone-number-input/style.css';
import paisesData from '../components/paisesData.json';
import { useNavigate } from 'react-router-dom';

export function DataCliente() {
    // Estado local para los datos del formulario
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

    const navigate = useNavigate();

    // Maneja el cambio del número de teléfono
    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phone: value });
    };

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes hacer lo que necesites con los datos del cliente
        alert('Datos guardados correctamente');
    };

    return (
        <div className="container mt-4">
            <h2>Dirección del Cliente</h2>
            <FormDir
                formData={formData}
                onChange={setFormData}
                onPhoneChange={handlePhoneChange}
                onSubmit={handleSubmit}
                showEmail={false}
                showResumen={false}
            />
            <button
                className="btn btn-secondary mt-2 col-md-2"
                onClick={() => navigate('/ClientView')}
            >
                &lt; Regresar
            </button>
        </div>
    );
}