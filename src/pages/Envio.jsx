import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import Swal from 'sweetalert2';
import { useCart } from '../components/CartContext'; // Hook para manipular el carrito
import { createPedido } from '../api/datos.api';

export function Envio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart(); // Función para vaciar el carrito

    // Obtiene los datos enviados desde la página anterior
    const { subtotal, isv, resumen, formData } = location.state || {
        subtotal: 0,
        isv: 0,
        resumen: [],
        formData: {},
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
                        // Genera la descripción con los nombres de los productos
                        const descripcionProductos = resumen.length === 1
                            ? resumen[0].nombre
                            : resumen.map(item => item.nombre).join(', ');

                        return actions.order.create({
                            purchase_units: [
                                {
                                    amount: {
                                        value: total.toFixed(2), // Total a pagar
                                    },
                                    description: descripcionProductos,
                                },
                            ],
                        });
                    }}
                    onApprove={(data, actions) => {
                        // Cuando el pago es aprobado y capturado
                        return actions.order.capture().then(async (details) => {
                            try {
                                // Obtener usuario del localStorage
                                const usuario = JSON.parse(localStorage.getItem('usuario'));

                                // Guarda los datos del cliente en localStorage
                                localStorage.setItem('usuario', JSON.stringify({
                                    firstName: formData.firstName,
                                    lastName: formData.lastName,
                                    email: formData.email,
                                }));
                                //const fechaEntrega = new Date(fechaCompra);
                                const fechaCompra = new Date();
                                // Crear un registro por cada producto en el carrito
                                for (const item of resumen) {
                                    const pedidoData = {           
                                        id_pedido: details.id,                                                                                                                                                                                                                   
                                        compañia: formData.company || '',
                                        direccion: formData.address,                                        
                                        pais: formData.country,
                                        estado_pais: formData.state,
                                        ciudad: formData.city,
                                        zip: formData.zip,
                                        correo: formData.email,    // Cambiado de email a correo
                                        telefono: formData.phone || '',
                                        estado_compra: 'Pagado',         
                                        desc_adicional: item.descripcion || '',
                                        producto: item.id,        // Enviamos solo el ID del producto
                                        cantidad: parseInt(item.cantidad),
                                        fecha_compra: fechaCompra.toISOString().split('T')[0],
                                        fecha_entrega: fechaCompra.toISOString().split('T')[0], // Por ahora usamos la misma fecha
                                    };

                                    // Convertir el objeto a FormData ERROR1
                                    const formDataToSend = new FormData();
                                    Object.keys(pedidoData).forEach(key => {
                                        if (pedidoData[key] !== null && pedidoData[key] !== undefined) {
                                            formDataToSend.append(key, pedidoData[key]);
                                        }
                                    });

                                    // Log para depuración
                                    console.log('Datos del pedido a enviar:', Object.fromEntries(formDataToSend));
                                    console.log('FormData entries:');
                                    for (let pair of formDataToSend.entries()) {
                                        console.log(pair[0] + ': ' + pair[1]);
                                    }

                                    const response = await createPedido(formDataToSend);
                                    console.log('Respuesta del servidor:', response);
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Pago completado',
                                    text: `Pago completado por ${details.payer.name.given_name}`,
                                }).then(() => {
                                    clearCart(); // Vacía el carrito
                                    navigate('/'); // Redirige al inicio
                                });
                            } catch (error) {
                                console.error('Error al crear el pedido:', error);
                                console.error('Detalles del error:', {
                                    message: error.message,
                                    response: error.response?.data,
                                    status: error.response?.status
                                });
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Hubo un error al procesar el pedido. Por favor, intente nuevamente.',
                                });
                            }
                        });
                    }}
                    onError={(err) => {
                        // Si ocurre un error en el pago
                        console.error('Error en el pago:', err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un error al procesar el pago.',
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
