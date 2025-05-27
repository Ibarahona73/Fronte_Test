import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import paisesData from '../components/paisesData.json';

export default function FormDir({
    formData,
    onChange,
    onPhoneChange,
    onSubmit,
    showEmail = true,
    showResumen = false,
    resumen = {},
    subtotal = 0,
    isv = 0,
    total = 0,
    disableNameFields = false,
    showCompany = true,
    isUpdating = false // Cambiado a false por defecto
}) {
    const [regiones, setRegiones] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    // Obtener tipo de región según país
    const getRegionKey = (country) => {
        if (!country) return 'departamentos';
        if (country === 'España') return 'comunidades_autonomas';
        if (country === 'Estados Unidos' || country === 'México') return 'estados';
        return 'departamentos';
    };

    // Obtener label para región
    const getRegionLabel = () => {
        if (!formData.country) return 'Estado/Departamento';
        if (formData.country === 'España') return 'Comunidad Autónoma';
        if (formData.country === 'Estados Unidos' || formData.country === 'México') return 'Estado';
        return 'Departamento/Estado';
    };

    // Cargar regiones al cambiar país
    useEffect(() => {
        if (formData.country) {
            const regionKey = getRegionKey(formData.country);
            if (paisesData[formData.country] && paisesData[formData.country][regionKey]) {
                const regionesData = paisesData[formData.country][regionKey];
                setRegiones(regionesData);
                
                // Si hay un estado seleccionado, cargar sus ciudades
                if (formData.state && paisesData[formData.country].ciudades) {
                    const ciudadesData = paisesData[formData.country].ciudades[formData.state] || [];
                    setCiudades(ciudadesData);
                }
            }
        }
    }, [formData.country, formData.state]);

    // Manejar cambio de país
    const handleCountryChange = (e) => {
        const selectedCountry = e.target.value;
        onChange({ 
            ...formData, 
            country: selectedCountry,
            state: '', 
            city: '' 
        });
        setCiudades([]);
    };

    // Manejar cambio de estado
    const handleStateChange = (e) => {
        const stateName = e.target.value;
        onChange({ ...formData, state: stateName, city: '' });
        
        if (formData.country && stateName && paisesData[formData.country]?.ciudades) {
            setCiudades(paisesData[formData.country].ciudades[stateName] || []);
        } else {
            setCiudades([]);
        }
    };

    // Manejar cambio de ciudad
    const handleCityChange = (e) => {
        onChange({ ...formData, city: e.target.value });
    };

    return (
        <form onSubmit={onSubmit} className="row mt-4">
            <div className="col-md-8">
                {showEmail && (
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={e => onChange({ ...formData, email: e.target.value })}
                            required
                            disabled={isUpdating}
                        />
                    </div>
                )}

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">Primer Nombre</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="form-control"
                            value={formData.firstName}
                            onChange={e => onChange({ ...formData, firstName: e.target.value })}
                            required
                            disabled={isUpdating}
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">Apellidos</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="form-control"
                            value={formData.lastName}
                            onChange={e => onChange({ ...formData, lastName: e.target.value })}
                            required
                            disabled={isUpdating}
                        />
                    </div>

                    {showCompany && (
                        <div className="col-md-6 mb-3">
                            <label htmlFor="company" className="form-label">Compañía (opcional)</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className="form-control"
                                value={formData.company}
                                onChange={e => onChange({ ...formData, company: e.target.value })}
                                disabled={isUpdating}
                            />
                        </div>
                    )}

                    <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Número Móvil</label>
                        <PhoneInput
                            international
                            defaultCountry="HN"
                            value={formData.phone}
                            onChange={onPhoneChange}
                            className="form-control"
                            id="phone"
                            name="phone"
                            required
                            countries={['HN', 'GT', 'SV', 'NI', 'CR', 'US', 'MX', 'ES','MG']}
                            disabled={isUpdating}
                        />
                        <small className="text-muted">Ejemplo: +504 9999-9999</small>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Dirección</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            className="form-control"
                            value={formData.address}
                            onChange={e => onChange({ ...formData, address: e.target.value })}
                            required
                            disabled={isUpdating}
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="country" className="form-label">País</label>
                        <select
                            id="country"
                            name="country"
                            className="form-select"
                            value={formData.country || ''}
                            onChange={handleCountryChange}
                            required
                            disabled={isUpdating}
                        >
                            <option value="">Seleccionar país</option>
                            {Object.keys(paisesData).map((countryName) => (
                                <option key={countryName} value={countryName}>{countryName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="state" className="form-label">{getRegionLabel()}</label>
                        <select
                            id="state"
                            name="state"
                            className="form-select"
                            value={formData.state || ''}
                            onChange={handleStateChange}
                            required
                            disabled={!formData.country || isUpdating}
                        >
                            <option value="">Seleccione {getRegionLabel().toLowerCase()}</option>
                            {regiones.map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">Ciudad</label>
                        <select
                            id="city"
                            name="city"
                            className="form-select"
                            value={formData.city || ''}
                            onChange={handleCityChange}
                            required
                            disabled={!formData.state || ciudades.length === 0 || isUpdating}
                        >
                            <option value="">Seleccione ciudad</option>
                            {ciudades.map((ciudad) => (
                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                            ))}
                            {ciudades.length === 0 && formData.state && (
                                <option value="" disabled>No hay ciudades disponibles</option>
                            )}
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="zip" className="form-label">Código Postal</label>
                        <input
                            type="text"
                            id="zip"
                            name="zip"
                            className="form-control"
                            value={formData.zip}
                            onChange={e => onChange({ ...formData, zip: e.target.value })}
                            required
                            disabled={isUpdating}
                        />
                    </div>
                </div>

                {!isUpdating && (
                    <button type="submit" className="btn btn-primary col-md-3">
                        {showEmail ? 'Siguiente' : 'Actualizar dirección'}
                    </button>
                )}
            </div>

            {showResumen && (
                <div className="col-md-4">
                    <h4>Resumen ({resumen.length} Artículo{resumen.length > 1 ? 's' : ''})</h4>
                    <div className="border p-3 rounded">
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p><strong>Est. ISV:</strong> ${isv.toFixed(2)}</p>
                        <hr />
                        <h5><strong>Total:</strong> ${total.toFixed(2)}</h5>
                    </div>
                    <h5>Detalles:</h5>
                    <ul>
                        {resumen.map((item, index) => (
                            <li key={index}>
                                {item.cantidad} x {item.nombre}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}