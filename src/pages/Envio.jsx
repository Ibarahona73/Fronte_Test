import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import Swal from 'sweetalert2';
import { useCart } from '../components/CartContext'; // Hook para manipular el carrito
import { createPedido } from '../api/datos.api';
import axios from 'axios';

export function Envio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart(); // Función para vaciar el carrito

    // Recuperar datos del localStorage si no hay state
    const savedClientInfo = localStorage.getItem('clientInfo');
    const savedData = savedClientInfo ? JSON.parse(savedClientInfo) : null;

    // Obtiene los datos enviados desde la página anterior o del localStorage
    const { subtotal, isv, resumen, formData } = location.state || {
        subtotal: 0,
        isv: 0,
        resumen: [],
        formData: savedData || {},
    };

    // Opciones de envío disponibles
    const shippingOptions = [
        { id: 'ups_ground', label: 'UPS Ground', cost: 2.20 },
        { id: 'ups_3day', label: 'UPS 3 Day Select', cost: 5.50 },
        { id: 'ups_2day', label: 'UPS 2nd Day Air', cost: 9.50 },
        { id: 'ups_nextday', label: 'UPS Next Day Air', cost: 12.50 },
    ];

    // Estado para el método de envío seleccionado y código de descuento
    const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].cost);
    const [discountCode, setDiscountCode] = useState('');

    // Construye la dirección de envío a partir de formData
    const shippingAddress = [
        formData.company && formData.company.trim(),
        formData.address && formData.address.trim(),
    ]
        .filter(Boolean)
        .join(', ');

    // Calcula el total sumando subtotal, ISV y envío
    const total = subtotal + isv + selectedShipping;

    // Maneja el cambio de método de envío
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
                {/* Selección de método de envío */}
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

                {/* Resumen de la compra */}
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

            {/* Sección de pago con PayPal */}
            <div className="mt-4">
                <h4>Pago</h4>
                <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    amount: {
                                        value: total.toFixed(2),
                                    },
                                    description: resumen.length === 1
                                        ? resumen[0].nombre
                                        : resumen.map(item => item.nombre).join(', '),
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            // Primero verificamos que el pago se haya capturado correctamente
                            const details = await actions.order.capture();
                            
                            if (!details || details.status !== 'COMPLETED') {
                                throw new Error('El pago no se completó correctamente');
                            }

                            // Obtener usuario del localStorage
                            const usuario = JSON.parse(localStorage.getItem('usuario'));

                            // Crear un ID de pedido único
                            const pedidoId = Date.now().toString();

                            // Crear un registro por cada producto en el carrito
                            const pedidosPromises = resumen.map(async (item) => {
                                // Calcular el envío proporcional para cada producto
                                const envioProporcional = selectedShipping / resumen.length;
                                
                                const pedidoData = {
                                    usuario_id: usuario?.id || null,
                                    company: formData.company || '',
                                    direccion: formData.address,
                                    pais: formData.country,
                                    estado_pais: formData.state,
                                    ciudad: formData.city,
                                    zip: formData.zip,
                                    correo: formData.email,
                                    telefono: formData.phone || '',
                                    estado_compra: 'Pagado',
                                    desc_adicional: item.descripcion || '',
                                    producto: item.id,
                                    cantidad_prod: item.cantidad,
                                    subtotal: (item.precio * item.cantidad).toFixed(2),
                                    isv: ((item.precio * item.cantidad) * 0.15).toFixed(2),
                                    envio: envioProporcional.toFixed(2),  // Envío proporcional
                                    total: (
                                        (item.precio * item.cantidad) + 
                                        ((item.precio * item.cantidad) * 0.15) + 
                                        envioProporcional
                                    ).toFixed(2),
                                    fecha_compra: new Date().toISOString().split('T')[0],
                                    fecha_entrega: new Date().toISOString().split('T')[0],
                                    es_movimiento_interno: false,
                                    id_pedido: pedidoId, // Agregar el ID de pedido único
                                };
                            
                                // Convertir pedidoData a FormData
                                const formDataToSend = new FormData();
                                for (const key in pedidoData) {
                                    if (pedidoData[key] !== null && pedidoData[key] !== undefined) {
                                        // Asegurarse de que envio se envía como string
                                        if (key === 'envio') {
                                            formDataToSend.append(key, pedidoData[key].toString());
                                        } else {
                                            formDataToSend.append(key, pedidoData[key]);
                                        }
                                    }
                                }
                            
                                try {
                                    const response = await createPedido(formDataToSend);
                                    console.log('Respuesta del servidor:', response);
                                    return response;
                                } catch (error) {
                                    console.error('Error al crear pedido:', error.response?.data || error);
                                    throw error;
                                }
                            });

                            // Esperar a que todos los pedidos se creen
                            await Promise.all(pedidosPromises);

                            // Limpiar datos del localStorage
                            localStorage.removeItem('clientInfo');

                            Swal.fire({
                                title: '¡Pedido registrado!',
                                html: `
                                    <div class="text-start">
                                        <p><strong>ID del Pedido:</strong> ${pedidoId}</p>
                                        <p><strong>Cliente:</strong> ${formData.firstName} ${formData.lastName}</p>
                                        <p><strong>Dirección:</strong> ${formData.address}</p>
                                        <p><strong>Ciudad:</strong> ${formData.city}</p>
                                        <p><strong>País:</strong> ${formData.country}</p>
                                        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                                        <p><strong>ISV:</strong> $${isv.toFixed(2)}</p>
                                        <p><strong>Envío:</strong> $${selectedShipping.toFixed(2)}</p>
                                        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                                    </div>
                                `,
                                icon: 'success'
                            }).then(() => {
                                clearCart();
                                navigate('/');
                            });
                        } catch (error) {
                            console.error('Error en el proceso de pago:', error);
                            let errorMessage = 'Hubo un error al procesar el pago. No se ha realizado ningún cobro.';
                            
                            if (error.response?.data) {
                                if (typeof error.response.data === 'object') {
                                    errorMessage = Object.entries(error.response.data)
                                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                                        .join('\n');
                                } else {
                                    errorMessage = error.response.data;
                                }
                            }

                            Swal.fire({
                                icon: 'error',
                                title: 'Error en el pago',
                                text: errorMessage,
                            });
                        }
                    }}
                    onCancel={() => {
                        Swal.fire({
                            icon: 'info',
                            title: 'Pago cancelado',
                            text: 'El proceso de pago ha sido cancelado. No se ha realizado ningún cobro.',
                        });
                    }}
                    onError={(err) => {
                        console.error('Error en el pago:', err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un error al procesar el pago. No se ha realizado ningún cobro.',
                        });
                    }}
                />
            </div>

            {/* Botón para regresar a la información del cliente */}
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
