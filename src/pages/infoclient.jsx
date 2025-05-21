import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import paisesData from '../components/paisesData.json';
import FormDir from '../components/Formdir';

export function InfoClient() {
    const location = useLocation();
    const navigate = useNavigate();

    // Datos recibidos desde el carrito o desde la página de envío
    const {
        subtotal = 0,
        isv = 0,
        total = 0,
        resumen = [],
        formData: initialFormData = {
            email: '',
            firstName: '',
            lastName: '',
            company: '',
            address: '',
            city: '',
            country: '',
            state: '',
            zip: '',
            phone: '',
        },
    } = location.state || {};

    // Estado local para los datos del formulario
    const [formData, setFormData] = useState(initialFormData);
    const [phoneValue, setPhoneValue] = useState(formData.phone || '');
    const [regiones, setRegiones] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    // Determinar el nombre correcto para la región según el país
    const getRegionKey = (country) => {
        if (!country) return 'departamentos';
        if (country === 'España') return 'comunidades_autonomas';
        if (country === 'Estados Unidos' || country === 'México') return 'estados';
        return 'departamentos';
    };

    // Cargar regiones cuando cambia el país
    useEffect(() => {
        if (formData.country && paisesData[formData.country]) {
            const regionKey = getRegionKey(formData.country);
            setRegiones(paisesData[formData.country][regionKey] || []);
            // Resetear estado y ciudad cuando cambia el país
            setFormData(prev => ({ ...prev, state: '', city: '' }));
            setCiudades([]);
        } else {
            setRegiones([]);
            setCiudades([]);
        }
    }, [formData.country]);

    // Cargar ciudades cuando cambia el estado/departamento
    useEffect(() => {
        if (formData.country && formData.state && paisesData[formData.country]?.ciudades[formData.state]) {
            setCiudades(paisesData[formData.country].ciudades[formData.state]);
            // Resetear ciudad cuando cambia el estado
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setCiudades([]);
        }
    }, [formData.state]);

    // Maneja los cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Maneja el cambio del número de teléfono
    const handlePhoneChange = (value) => {
        setPhoneValue(value);
        setFormData({ ...formData, phone: value });
    };

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!phoneValue) {
            alert('Por favor ingrese un número de teléfono válido');
            return;
        }
        if (!formData.state) {
            alert('Por favor seleccione un estado/departamento');
            return;
        }
        if (!formData.city) {
            alert('Por favor seleccione una ciudad');
            return;
        }

        // Redirige a la página de envío con los datos necesarios
        navigate('/envio', {
            state: {
                subtotal,
                isv,
                total,
                resumen,
                formData: {
                    ...formData,
                    phone: phoneValue
                },
            },
        });
    };

    // Obtener el label adecuado para la región según el país
    const getRegionLabel = () => {
        if (!formData.country) return 'Estado/Departamento';
        if (formData.country === 'España') return 'Comunidad Autónoma';
        if (formData.country === 'Estados Unidos' || formData.country === 'México') return 'Estado';
        return 'Departamento';
    };

    return (
        <div className="container mt-4">
            <h2>Información de Cliente</h2>
            <br></br>
            <h4>Datos de Envio</h4>
            <FormDir
                formData={formData}
                onChange={setFormData}
                onPhoneChange={handlePhoneChange}
                onSubmit={handleSubmit}
                showEmail={true}
                showResumen={true}
                resumen={resumen}
                subtotal={subtotal}
                isv={isv}
                total={total}
            />
            <button
                className="btn btn-secondary mt-2 col-md-2"
                onClick={() => navigate('/carrito')}
            >
                &lt; Regresar
            </button>
        </div>
    ); 
}