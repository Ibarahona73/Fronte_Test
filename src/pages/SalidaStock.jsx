import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto } from '../api/datos.api'; // Asegúrate de tener esta función para obtener los datos del producto
import 'bootstrap/dist/css/bootstrap.min.css';

export function SalidaStock() {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!descripcion.trim()) {
            alert('Por favor, ingresa una descripción para la salida de stock.');
            return;
        }
        // Aquí puedes manejar la lógica para registrar la salida de stock
        console.log({
            productoId: id,
            cantidad,
            descripcion,
        });
        alert('Salida de stock registrada exitosamente.');
        navigate('/inventario'); // Redirigir al inventario después de registrar la salida
    };

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Salida de Stock</h1>
            <div className="row">
                {/* Imagen del producto */}
                <div className="col-md-6">
                    <img
                        src={producto.imagen_base64 ? `data:image/jpeg;base64,${producto.imagen_base64}` : 'https://via.placeholder.com/300'}
                        alt={producto.nombre}
                        className="img-fluid rounded"
                    />
                    <div className="d-flex mt-3">
                        {/* Miniaturas de imágenes relacionadas */}
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: '#f0f0f0',
                                    marginRight: '10px',
                                    borderRadius: '5px',
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Formulario de salida de stock */}
                <div className="col-md-6">
                    <h2>{producto.nombre}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Tamaño */}
                        <div className="mb-3">
                            <label htmlFor="tamaño" className="form-label">Tamaño</label>
                            <select id="tamaño" className="form-select" disabled>
                                <option>{producto.tamaño}</option>
                            </select>
                        </div>

                        {/* Cantidad */}
                        <div className="mb-3">
                            <label htmlFor="cantidad" className="form-label">Cantidad</label>
                            <select
                                id="cantidad"
                                className="form-select"
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                size={5} // Mostrar 5 opciones con scrollbar si hay más
                                style={{ overflowY: 'auto' }}
                            >
                                {Array.from({ length: Math.max(producto.cantidad_en_stock, 5) }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
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
                                placeholder="Descripción del porqué la salida del producto"
                            ></textarea>
                        </div>

                        {/* Botones */}
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

            {/* Productos relacionados */}
            <div className="mt-5">
                <h3>Productos Relacionados</h3>
                <div className="d-flex gap-3">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '5px',
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}