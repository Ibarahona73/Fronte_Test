import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto } from '../api/datos.api';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

export function SalidaStock() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [descripcion, setDescripcion] = useState('');
    const [compania, setCompania] = useState('');
    const [tipoSalida, setTipoSalida] = useState('CONVENIO');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProducto() {
            try {
                const data = await getProducto(id);
                setProducto(data);
            } catch (err) {
                setError('No se pudo cargar el producto.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducto();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!compania.trim()) {
            Swal.fire('Error', 'Debe especificar la compañía destino', 'warning');
            return;
        }

        if (cantidad <= 0) {
            Swal.fire('Error', 'La cantidad debe ser mayor a cero', 'warning');
            return;
        }

        try {
            const response = await axios.post('https://tiendaonline-backend-yaoo.onrender.com/api/v1/movimientos/', {
                producto_id: id,
                cantidad: cantidad,
                tipo_salida: tipoSalida,
                compania_destino: compania,
                descripcion: descripcion,
                es_movimiento_interno: true,
                subtotal: 0.00,
                isv: 0.00,
                envio: 0.00,
                total: 0.00
            });

            Swal.fire({
                title: '¡Salida registrada!',
                html: `
                    <div class="text-start">
                        <p><strong>Producto:</strong> ${producto.nombre}</p>
                        <p><strong>Cantidad:</strong> ${cantidad}</p>
                        <p><strong>Destino:</strong> ${compania}</p>
                        <p><strong>Referencia:</strong> Pedido #${response.data.pedido_id}</p>
                        <p><strong>Stock actual:</strong> ${response.data.stock_actual}</p>
                        <p><strong>Subtotal:</strong> $0.00</p>
                        <p><strong>ISV:</strong> $0.00</p>
                        <p><strong>Envío:</strong> $0.00</p>
                        <p><strong>Total:</strong> $0.00</p>
                    </div>
                `,
                icon: 'success'
            });
            
            navigate('/admin/inventario');
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al registrar la salida';
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    if (loading) return <div className="text-center mt-4">Cargando producto...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Registro de Salida</h1>
            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">{producto.nombre}</h5>
                            <p className="card-text">
                                <strong>Stock actual:</strong> {producto.cantidad_en_stock}
                            </p>
                            <p className="card-text">
                                <strong>Tamaño:</strong> {producto.tamaño}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            Detalles de Salida
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tipo de Salida</label>
                                    <select 
                                        className="form-select"
                                        value={tipoSalida}
                                        onChange={(e) => setTipoSalida(e.target.value)}
                                        required
                                    >
                                        <option value="CONVENIO">Convenio</option>
                                        <option value="DONACION">Donación</option>
                                        <option value="PRESTAMO">Préstamo</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Compañía Destino</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={compania}
                                        onChange={(e) => setCompania(e.target.value)}
                                        required
                                        placeholder="Nombre de la compañía o persona"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Cantidad</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                                        min="1"
                                        max={producto.cantidad_en_stock}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Motivo de la salida"
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Subtotal</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value="0.00"
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">ISV</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value="0.00"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Envío</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value="0.00"
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Total</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value="0.00"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={!compania || cantidad <= 0}
                                    >
                                        Registrar Salida
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}