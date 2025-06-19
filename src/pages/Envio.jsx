import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import Swal from 'sweetalert2';
import { useCart } from '../components/CartContext'; // Hook para manipular el carrito
import { createPedido, getCarrito } from '../api/datos.api';
import { useStockRealtimeUpdater } from '../components/useStockRealtimeUpdater';

export function Envio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart, removeFromCart } = useCart(); // Obtenemos removeFromCart del contexto

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

    // Debug: Ver el resumen completo
    console.log('Resumen completo recibido:', resumen);
    console.log('Tipo de resumen:', typeof resumen);
    console.log('Es array:', Array.isArray(resumen));

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

    useStockRealtimeUpdater((producto_id, nuevo_stock) => {
        Swal.fire({
            icon: 'info',
            title: 'Stock actualizado',
            text: `El producto con ID ${producto_id} tiene ahora ${nuevo_stock} unidades en stock. Si tu pedido depende de este producto, revisa tu carrito antes de continuar.`
        });
    });

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
                            const usuarioStr = localStorage.getItem('usuario');
                            if (!usuarioStr) {
                                throw new Error('No hay usuario autenticado');
                            }
                            const usuario = JSON.parse(usuarioStr);

                            // Crear un ID de pedido único
                            const pedidoId = Date.now().toString();

                            // Calcular el envío proporcional para cada producto
                            const envioProporcional = selectedShipping / resumen.length;
                            
                            // Obtener los datos del formulario
                            const clientInfo = JSON.parse(localStorage.getItem('clientInfo') || '{}');
                            
                            // Crear objeto de pedido
                            const pedidoData = {
                                usuario_id: usuario.id,
                                company: clientInfo.company || '',
                                direccion: clientInfo.address || '',
                                pais: clientInfo.country || '',
                                estado_pais: clientInfo.state || '',
                                ciudad: clientInfo.city || '',
                                zip: clientInfo.zip || '',
                                correo: clientInfo.email || '',
                                telefono: clientInfo.phone || '',
                                estado_compra: 'Pagado',
                                desc_adicional: resumen[0]?.descripcion || '',
                                fecha_compra: new Date().toISOString().split('T')[0],
                                fecha_entrega: new Date().toISOString().split('T')[0],
                                es_movimiento_interno: false,
                                id_pedido: pedidoId,
                                productos: resumen.map(item => {
                                    // Debug: Ver la estructura exacta del item
                                    console.log('Item del resumen:', item);
                                    console.log('Item.id:', item.id);
                                    console.log('Tipo de item.id:', typeof item.id);
                                    
                                    // Asegurarnos de que el ID del producto sea válido
                                    if (!item.id) {
                                        console.error('Item sin ID:', item);
                                        throw new Error(`El producto ${item.nombre} no tiene un ID válido`);
                                    }
                                    
                                    const productoData = {
                                        producto_id: item.id, // El ID está directamente en item.id
                                        cantidad: item.cantidad,
                                        precio: parseFloat(item.precio),
                                        subtotal: (parseFloat(item.precio) * item.cantidad).toFixed(2),
                                        isv: (parseFloat(item.precio) * item.cantidad * 0.15).toFixed(2),
                                        envio: envioProporcional.toFixed(2),
                                        total: (
                                            (parseFloat(item.precio) * item.cantidad) + 
                                            (parseFloat(item.precio) * item.cantidad * 0.15) + 
                                            envioProporcional
                                        ).toFixed(2)
                                    };
                                    
                                    console.log('Producto data creado:', productoData);
                                    return productoData;
                                })
                            }; // Fin del objeto pedidoData

                            // Debug: Verificar datos antes de enviar a createPedido
                            console.log('Datos del pedido a enviar a createPedido:', pedidoData);

                            // Intentar crear el pedido después del pago exitoso
                            try {
                                const response = await createPedido(pedidoData);
                                console.log('Respuesta del servidor:', response);

                                // Limpiar datos del localStorage
                                localStorage.removeItem('clientInfo');

                                // Eliminar cada producto del carrito individualmente para devolverlos al stock
                                try {
                                    // Obtener el carrito actual
                                    const carritoActual = await getCarrito();
                                    
                                    // Eliminar cada producto del carrito
                                    for (const item of carritoActual) {
                                        try {
                                            await removeFromCart(item.id);
                                            console.log(`Producto ${item.producto_nombre} eliminado del carrito y devuelto al stock`);
                                        } catch (error) {
                                            console.error(`Error al eliminar producto ${item.producto_nombre} del carrito:`, error);
                                        }
                                    }
                                    
                                    console.log('Carrito limpiado exitosamente y productos devueltos al stock');
                                } catch (error) {
                                    console.error('Error al limpiar el carrito:', error);
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Advertencia',
                                        text: 'El pedido se realizó correctamente, pero hubo un problema al actualizar el stock. Por favor, contacte al administrador.',
                                    });
                                }

                                Swal.fire({
                                    title: '¡Pedido registrado!',
                                    html: `
                                        <div class="text-start">
                                            <p><strong>ID del Pedido:</strong> ${pedidoId}</p>
                                            <p><strong>Cliente:</strong> ${clientInfo.firstName} ${clientInfo.lastName}</p>
                                            <p><strong>Dirección:</strong> ${clientInfo.address}</p>
                                            <p><strong>Ciudad:</strong> ${clientInfo.city}</p>
                                            <p><strong>País:</strong> ${clientInfo.country}</p>
                                            <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                                            <p><strong>ISV:</strong> $${isv.toFixed(2)}</p>
                                            <p><strong>Envío:</strong> $${selectedShipping.toFixed(2)}</p>
                                            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                                        </div>
                                    `,
                                    icon: 'success'
                                }).then(() => {
                                    navigate('/');
                                });
                            } catch (error) {
                                console.error('Error al crear el pedido:', error);
                                let errorMessage = 'Error al crear el pedido';
                                let errorDetails = '';

                                if (error.response?.data) {
                                    if (typeof error.response.data === 'object') {
                                        errorDetails = Object.entries(error.response.data)
                                            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                                            .join('\n');
                                    } else {
                                        errorDetails = error.response.data;
                                }
                                }
                                //HOLAJFKJLKFDSFSDFJK
                                Swal.fire({
                                    icon: 'error',
                                    title: errorMessage,
                                    html: `
                                        <div class="text-start">
                                            <p>${errorDetails || 'Ocurrió un error inesperado al procesar la solicitud'}</p>
                                            <p class="mt-3">Por favor, verifica que todos los datos del pedido sean correctos e intenta nuevamente.</p>
                                        </div>
                                    `,
                                    confirmButtonText: 'Entendido'
                                }).then(async () => {
                                    // Redirigir a carrito
                                    navigate('/carrito');
                                    // Limpiar el carrito (eliminar todos los productos)
                                    try {
                                        const carritoActual = await getCarrito();
                                        for (const item of carritoActual) {
                                            await removeFromCart(item.id);
                                        }
                                    } catch (e) {
                                        console.error('Error al limpiar el carrito tras error en pedido:', e);
                                    }
                                });
                            }
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
