import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';

export function Envio() {
    const location = useLocation();
    const navigate = useNavigate();

    const { subtotal, isv, resumen, formData } = location.state || {
        subtotal: 0,
        isv: 0,
        resumen: [],
        formData: {},
    };

    const shippingOptions = [
        { id: 'ups_ground', label: 'UPS Ground', cost: 2.20 },
        { id: 'ups_3day', label: 'UPS 3 Day Select', cost: 5.50 },
        { id: 'ups_2day', label: 'UPS 2nd Day Air', cost: 9.50 },
        { id: 'ups_nextday', label: 'UPS Next Day Air', cost: 12.50 },
    ];

    const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].cost);
    const [discountCode, setDiscountCode] = useState('');

    const shippingAddress = [
        formData.company && formData.company.trim(),
        formData.address && formData.address.trim(),
    ]
        .filter(Boolean)
        .join(', ');

    const total = subtotal + isv + selectedShipping;

    const handleShippingChange = (e) => {
        const selectedCost = parseFloat(e.target.value);
        setSelectedShipping(selectedCost);
    };

    return (
        <div className="container mt-4">
            <h2>Información de Envío</h2>
            <p>
                <strong>Dirección de envío:</strong> {shippingAddress}{' '}
                <span
                    style={{ color: '#3498db', cursor: 'pointer' }}
                    onClick={() => navigate('/infoclient')}
                >
                    Edit
                </span>
            </p>

            <div className="row">
                <div className="col-md-8">
                    <h4>Método de Envío</h4>
                    <form>
                        {shippingOptions.map((option) => (
                            <div key={option.id} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="shippingMethod"
                                    id={option.id}
                                    value={option.cost}
                                    checked={selectedShipping === option.cost}
                                    onChange={handleShippingChange}
                                />
                                <label className="form-check-label" htmlFor={option.id}>
                                    {option.label} - ${option.cost.toFixed(2)}
                                </label>
                            </div>
                        ))}
                    </form>
                </div>

                <div className="col-md-4">
                    <h4>Resumen ({resumen.reduce((acc, item) => acc + item.cantidad, 0)} Artículo{resumen.length > 1 ? 's' : ''})</h4>
                    <div className="border p-3 rounded">
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p><strong>Envío:</strong> ${selectedShipping.toFixed(2)}</p>
                        <p><strong>Est. ISV:</strong> ${isv.toFixed(2)}</p>
                        <hr />
                        <h5><strong>Total:</strong> ${total.toFixed(2)}</h5>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h4>Pago</h4>
                <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    amount: {
                                        value: total.toFixed(2), // Total a pagar
                                    },
                                    description: 'Compra en Tienda Online',
                                },
                            ],
                        });
                    }}
                    onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                            alert(`Pago completado por ${details.payer.name.given_name}`);
                            navigate('/'); // Redirige al inicio o a una página de confirmación
                        });
                    }}
                    onError={(err) => {
                        console.error('Error en el pago:', err);
                        alert('Hubo un error al procesar el pago.');
                    }}
                />
            </div>

            <div className="mt-4 d-flex gap-3">
                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate('/infoclient', {
                            state: {
                                subtotal,
                                isv,
                                total: subtotal + isv,
                                resumen,
                                formData,
                            },
                        })
                    }
                >
                    &lt; Regresar al Información de Cliente
                </button>
            </div>
        </div>
    );
}