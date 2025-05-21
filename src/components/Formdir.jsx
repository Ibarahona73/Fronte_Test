import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import paisesData from '../components/paisesData.json';
import { useNavigate } from 'react-router-dom';

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
    total = 0
}) {
    const [regiones, setRegiones] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const navigate = useNavigate();

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
            onChange({ ...formData, state: '', city: '' });
            setCiudades([]);
        } else {
            setRegiones([]);
            setCiudades([]);
        }
        // eslint-disable-next-line
    }, [formData.country]);

    // Cargar ciudades cuando cambia el estado/departamento
    useEffect(() => {
        if (formData.country && formData.state && paisesData[formData.country]?.ciudades[formData.state]) {
            setCiudades(paisesData[formData.country].ciudades[formData.state]);
            onChange({ ...formData, city: '' });
        } else {
            setCiudades([]);
        }
        // eslint-disable-next-line
    }, [formData.state]);

    // Obtener el label adecuado para la región según el país
    const getRegionLabel = () => {
        if (!formData.country) return 'Estado/Departamento';
        if (formData.country === 'España') return 'Comunidad Autónoma';
        if (formData.country === 'Estados Unidos' || formData.country === 'México') return 'Estado';
        return 'Departamento';
    };

    return (
        <form onSubmit={onSubmit} className="row mt-4">
            <div className="col-md-8">
                {/* Campo de correo electrónico */}
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
                        />
                    </div>
                )}

                {/* Datos de Envío */}                
                <div className="row">
                    {/* Primer Nombre */}
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
                        />
                    </div>
                    {/* Apellidos */}
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
                        />
                    </div>
                    {/* Compañía (opcional) */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="company" className="form-label">Compañía (opcional)</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            className="form-control"
                            value={formData.company}
                            onChange={e => onChange({ ...formData, company: e.target.value })}
                        />
                    </div>
                    {/* Número Móvil */}
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
                        />
                        <small className="text-muted">Ejemplo: +504 9999-9999</small>
                    </div>
                    {/* Dirección */}
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
                        />
                    </div>
                    {/* País */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="country" className="form-label">País</label>
                        <select
                            id="country"
                            name="country"
                            className="form-select"
                            value={formData.country}
                            onChange={e => onChange({ ...formData, country: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar país</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Estados Unidos">Estados Unidos</option>
                            <option value="México">México</option>
                            <option value="España">España</option>
                        </select>
                    </div>
                    {/* Estado/Departamento */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="state" className="form-label">{getRegionLabel()}</label>
                        <select
                            id="state"
                            name="state"
                            className="form-select"
                            value={formData.state}
                            onChange={e => onChange({ ...formData, state: e.target.value })}
                            required
                            disabled={!formData.country}
                        >
                            <option value="">Seleccione {getRegionLabel().toLowerCase()}</option>
                            {regiones.map((region, index) => (
                                <option key={index} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                    {/* Ciudad */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">Ciudad</label>
                        <select
                            id="city"
                            name="city"
                            className="form-select"
                            value={formData.city}
                            onChange={e => onChange({ ...formData, city: e.target.value })}
                            required
                            disabled={!formData.state || ciudades.length === 0}
                        >
                            <option value="">Seleccione ciudad</option>
                            {ciudades.map((ciudad, index) => (
                                <option key={index} value={ciudad}>{ciudad}</option>
                            ))}
                            {ciudades.length === 0 && formData.state && (
                                <option value="" disabled>No hay ciudades disponibles</option>
                            )}
                        </select>
                    </div>
                    {/* Código postal */}
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
                        />
                    </div>
                </div>
                {/* Botón para continuar */}
                <button type="submit" className="btn btn-primary col-md-3">
                    {showEmail ? 'Siguiente' : 'Actualizar dirección'}
                </button>
            </div>
            {/* Resumen del pedido (opcional) */}
            {showResumen && (
                <div className="col-md-4">
                    <h4>Resumen ({resumen.length} Artículo{resumen.length > 1 ? 's' : ''})</h4>
                    <div className="border p-3 rounded">
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p><strong>Est. ISV:</strong> ${isv.toFixed(2)}</p>
                        <hr />
                        <h5><strong>Total:</strong> ${total.toFixed(2)}</h5>
                    </div>
                    {/* Detalles de los productos */}
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
