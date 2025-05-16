import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
            apartment: '',
            country: '',
            state: '',
            zip: '',
        },
    } = location.state || {};

    const [formData, setFormData] = useState(initialFormData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Redirige a la página de envío con los datos necesarios
        navigate('/envio', {
            state: {
                subtotal,
                isv,
                total,
                resumen,
                formData,
            },
        });
    };

    return (
        <div className="container mt-4">
            <h2>Información de Cliente</h2>
            <form onSubmit={handleSubmit} className="row mt-4">
                {/* Información de Cliente */}
                <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Datos de Envío */}
                    <h4>Datos de Envío</h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">Primer Nombre</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="form-control"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
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
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="company" className="form-label">Compañía (opcional)</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className="form-control"
                                value={formData.company}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address" className="form-label">Dirección</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="form-control"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="apartment" className="form-label">Apt. (Opcional)</label>
                            <input
                                type="text"
                                id="apartment"
                                name="apartment"
                                className="form-control"
                                value={formData.apartment}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="country" className="form-label">País</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                className="form-control"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="state" className="form-label">Estado</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                className="form-control"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="zip" className="form-label">Zip</label>
                            <input
                                type="text"
                                id="zip"
                                name="zip"
                                className="form-control"
                                value={formData.zip}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Siguiente</button>
                </div>

                {/* Resumen */}
                <div className="col-md-4">
                    <h4>Resumen ({resumen.reduce((acc, item) => acc + item.cantidad, 0)} Artículo{resumen.length > 1 ? 's' : ''})</h4>
                    <div className="border p-3 rounded">
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p><strong>Envío:</strong> $0.00</p>
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
                    <button
                        type="button"
                        className="btn btn-secondary mt-3"
                        onClick={() => navigate('/carrito')}
                    >
                        &lt; Regresar al Carrito
                    </button>
                </div>
            </form>
        </div>
    ); 
}