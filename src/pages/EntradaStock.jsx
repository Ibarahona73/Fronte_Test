import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, addProductoStock } from '../api/datos.api'; // Asegúrate de tener esta función para actualizar el stock
import 'bootstrap/dist/css/bootstrap.min.css';

export function EntradaStock() {
    const { id } = useParams(); // Obtener el ID del producto desde la URL
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion.trim()) {
            alert('Por favor, ingresa una descripción para la entrada de stock.');
            return;
        }

        try {
            // Calcular el nuevo stock sumando la cantidad seleccionada
            const nuevoStock = producto.cantidad_en_stock + cantidad;

            // Actualizar el stock en la base de datos
            await addProductoStock(id, nuevoStock);

            alert('Entrada de stock registrada exitosamente.');
            navigate('/inventario'); // Redirigir al inventario después de registrar la entrada
        } catch (err) {
            console.error('Error al registrar la entrada de stock:', err);
            alert('Hubo un error al registrar la entrada de stock.');
        }
    };

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Entrada de Stock</h1>
            <div className="row">
                {/* Imagen del producto */}
                <div className="col-md-6">
                    <img
                        src={producto?.imagen_base64 ? `data:image/jpeg;base64,${producto.imagen_base64}` : 'https://via.placeholder.com/300'}
                        alt={producto?.nombre}
                        className="img-fluid rounded"
                    />
                </div>

                {/* Formulario de entrada de stock */}
                <div className="col-md-6">
                    <h2>{producto?.nombre}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Tamaño */}
                        <div className="mb-3">
                            <label htmlFor="tamaño" className="form-label">Tamaño</label>
                            <select id="tamaño" className="form-select" disabled>
                                <option>{producto?.tamaño}</option>
                            </select>
                        </div>

                        {/* Cantidad */}
                        <div className="mb-3">
                            <label htmlFor="cantidad" className="form-label">Cantidad</label>
                            <input
                                type="number"
                                id="cantidad"
                                className="form-control"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                min="1"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                            <textarea
                                id="descripcion"
                                className="form-control"
                                rows="3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del porqué la entrada del producto"
                            ></textarea>
                        </div>

                        {/* Botones */}
                        <div className="d-flex gap-3">
                            <button type="submit" className="btn btn-primary">
                                Registrar Entrada
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