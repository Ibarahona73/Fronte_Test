import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, updateProductoStock } from '../api/datos.api'; // Asegúrate de tener esta función para actualizar el stock
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

export function SalidaStock() {
    const { id } = useParams(); // Obtener el ID del producto desde la URL
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null); // Estado para el producto
    const [cantidad, setCantidad] = useState(1); // Estado para la cantidad a retirar
    const [descripcion, setDescripcion] = useState(''); // Estado para la descripción
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error

    // Cargar los datos del producto al montar el componente
    useEffect(() => {
        async function fetchProducto() {
            try {
                const data = await getProducto(id); // Obtener los datos del producto
                setProducto(data);
            } catch (err) {
                console.error('Error al cargar el producto:', err);
                setError('No se pudo cargar el producto.');
            } finally {
                setLoading(false);
            }
        }
        fetchProducto();
    }, [id]); // Solo se ejecuta cuando cambia el id

    // Maneja el envío del formulario de salida de stock
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validar que la descripción no esté vacía
        if (!descripcion.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor, ingresa una descripción para la salida de stock.',
            });
            return;
        }

        // Validar que la cantidad seleccionada no exceda el stock disponible
        if (cantidad > producto.cantidad_en_stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Cantidad excedida',
                text: 'La cantidad seleccionada excede el stock disponible.',
            });
            return;
        }

        try {
            // Calcular el nuevo stock (opcional, aquí solo para referencia)
            const nuevoStock = producto.cantidad_en_stock - cantidad;

            // Actualizar el stock en la base de datos (resta la cantidad al stock actual)
            await updateProductoStock(id, -cantidad);

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Salida de stock registrada exitosamente.',
            });
            // Redirigir al inventario después de registrar la salida
            navigate('/inventario');
        } catch (err) {
            // Mostrar mensaje de error si falla el registro
            console.error('Error al registrar la salida de stock:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al registrar la salida de stock.',
            });
        }
    };

    // Mostrar mensaje de carga o error si corresponde
    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Salida de Stock</h1>
            <div className="row">
                {/* Imagen del producto */}
                <div className="col-md-6">
                    <img
                        src={producto.image ? `data:image/jpeg;base64,${producto.image}` : 'https://via.placeholder.com/300'}
                        alt={producto.nombre}
                        className="img-fluid rounded"
                    />
                </div>

                {/* Formulario de salida de stock */}
                <div className="col-md-6">
                    <h2>{producto.nombre}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Tamaño del producto (solo lectura) */}
                        <div className="mb-3">
                            <label htmlFor="tamaño" className="form-label">Tamaño</label>
                            <select id="tamaño" className="form-select" disabled>
                                <option>{producto.tamaño}</option>
                            </select>
                        </div>

                        {/* Cantidad a retirar */}
                        <div className="mb-3">
                            <label htmlFor="cantidad" className="form-label">Cantidad</label>
                            <input
                                type="number"
                                id="cantidad"
                                className="form-control"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                min="1"
                                max={producto.cantidad_en_stock}
                            />
                        </div>

                        {/* Descripción de la salida */}
                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                            <textarea
                                id="descripcion"
                                className="form-control"
                                rows="3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del porqué la salida del producto"
                            ></textarea>
                        </div>

                        {/* Botones de acción */}
                        <div className="d-flex gap-3">
                            <button type="submit" className="btn btn-primary">
                                Registrar Salida
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                Regresar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}