import { getProductos } from "../api/datos.api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import React from 'react';
import { useCart } from './CartContext'; // Importamos useCart
import Swal from 'sweetalert2'; // Importamos Swal para mensajes de alerta

// Componente para mostrar el listado de productos en inventario con filtros y acciones
export function Listado() {
    const [productos, setProductos] = useState([]); // Todos los productos
    const [filteredProductos, setFilteredProductos] = useState([]); // Productos filtrados
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [filters, setFilters] = useState({
        categoria: '',
        tamaño: '',
        color: '',
    });

    const navigate = useNavigate();
    const cart = useCart(); // Obtenemos el estado del carrito
    const { addToCart } = useCart(); // Obtenemos la función addToCart

    // Cargar productos al montar el componente
    useEffect(() => {
        async function cargaProductos() {
            try {
                const res = await getProductos();
                // Agrega la imagen en base64 si existe y calcula el stock_Frontend inicial
                
                const productosConImagenes = res.map(producto => {
                    // Encuentra si el producto ya está en el carrito
                    console.log('carrito',cart)
                    //console.log('Producto',itemEnCarrito)    

                    //const itemEnCarrito = cart.find(item => item.producto.id === producto.id);                                     
                    //const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad_prod : 0;


                    return {
                        ...producto,
                        imagen: producto.image
                            ? `data:image/jpeg;base64,${producto.image}`
                            : null,
                        //stock_Frontend: producto.stock_disponible - cantidadEnCarrito, // stock_Frontend es el stock real - lo que ya está en el carrito
                    };
                    
                });                
                setProductos(productosConImagenes);
                setFilteredProductos(productosConImagenes);
            } catch (error) {
                console.error("Error:", error);
                setError("Error al cargar productos");
            } finally {
                setLoading(false);
            }
        }
        cargaProductos();
    }, []); // Solo una vez al montar

    // Aplicar filtros cada vez que cambian los filtros o los productos
    useEffect(() => {
        let result = [...productos];

        if (filters.categoria) {
            result = result.filter((p) => p.categoria === filters.categoria);
        }

        if (filters.tamaño) {
            result = result.filter((p) => p.tamaño === filters.tamaño);
        }

        if (filters.color) {
            result = result.filter((p) => p.colores === filters.color);
        }

        setFilteredProductos(result);
    }, [filters, productos]);

    // Sincronizar stock_Frontend cuando cambia el carrito
    useEffect(() => {
        if (productos.length > 0 && cart.length > 0) {
            setProductos(prevProductos =>
                prevProductos.map(producto => {
                    const itemEnCarrito = cart.find(item => item.producto.id === producto.id);
                    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad_prod : 0;
                    return {
                        ...producto,
                        stock_Frontend: producto.stock_disponible - cantidadEnCarrito,
                    };
                })
            );
            setFilteredProductos(prevFilteredProductos =>
                prevFilteredProductos.map(producto => {
                    const itemEnCarrito = cart.find(item => item.producto.id === producto.id);
                    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad_prod : 0;
                    return {
                        ...producto,
                        stock_Frontend: producto.stock_disponible - cantidadEnCarrito,
                    };
                })
            );
        }
    }, [cart, productos]); // Depende de cart y productos para re-calcular

    const handleAddToCart = async (product) => {
        if (product.stock_Frontend <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Insuficiente',
                text: 'No hay más unidades disponibles de este producto.',
            });
            return;
        }

        try {
            await addToCart(product, 1); // Añadir 1 unidad al carrito
            Swal.fire({
                icon: 'success',
                title: 'Producto Añadido',
                text: `${product.nombre} ha sido añadido a tu carrito.`, 
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo añadir el producto al carrito. Por favor, intenta nuevamente.',
            });
        }
    };

    if (loading) return <div>Cargando productos...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Obtener valores únicos para los filtros
    const uniqueColors = [...new Set(productos.map((p) => p.colores).filter(Boolean))];
    const allSizes = ['S (Pequeño)' , 'M (Mediano)', 'L (Largo)', 'XL (Extra Largo)', 'XXL (XXL)']; // Todos los tamaños posibles
    const uniqueCategories = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar de filtros */}
            <div
                style={{
                    width: '250px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRight: '1px solid #e0e0e0',
                    position: 'sticky',
                    top: '70px',
                    height: 'calc(100vh - 70px)',
                    overflowY: 'auto',
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Filtros</h3>

                {/* Filtro por categoría */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Categoría</h4>
                    {uniqueCategories.map((cat) => (
                        <div key={cat} style={{ marginBottom: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="categoria"
                                    checked={filters.categoria === cat}
                                    onChange={() => setFilters({ ...filters, categoria: cat })}
                                    style={{ marginRight: '8px' }}
                                />
                                {cat}
                            </label>
                        </div>
                    ))}
                    <button
                        onClick={() => setFilters({ ...filters, categoria: '' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem',
                        }}
                    >
                        Limpiar
                    </button>
                </div>

                {/* Filtro por tamaño */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Tamaño</h4>
                    {allSizes.map((size) => (
                        <div key={size} style={{ marginBottom: '5px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="tamaño"
                                    checked={filters.tamaño === size}
                                    onChange={() => setFilters({ ...filters, tamaño: size })}
                                    style={{ marginRight: '8px' }}
                                />
                                {size}
                            </label>
                        </div>
                    ))}
                    <button
                        onClick={() => setFilters({ ...filters, tamaño: '' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem',
                        }}
                    >
                        Limpiar
                    </button>
                </div>

                {/* Filtro por color */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Color</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {uniqueColors.map((color) => (
                            <div key={color} style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="color"
                                    checked={filters.color === color}
                                    onChange={() => setFilters({ ...filters, color })}
                                    style={{ marginRight: '8px' }}
                                />
                                <div
                                    style={{
                                        display: 'inline-block',
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setFilters({ ...filters, color: '' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            padding: '5px 0',
                            fontSize: '0.9rem',
                        }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Listado de productos */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    padding: '20px',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                }}
            >
                {filteredProductos.map((producto) => (
                    <div
                        key={producto.id}
                        className="product-item border p-3 d-flex flex-column align-items-center text-center"
                        style={{
                            borderRadius: '5px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            backgroundColor: '#fff',
                            width: '300px',
                        }}
                    >
                        {/* Imagen del producto */}
                        {producto.imagen ? (
                            <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                    marginBottom: '10px',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '5px',
                                    fontSize: '0.8rem',
                                    color: '#888',
                                    marginBottom: '10px',
                                }}
                            >
                                Sin Imagen
                            </div>
                        )}

                        {/* Nombre del producto */}
                        <h6 className="mb-1">{producto.nombre}</h6>

                        {/* Precio del producto */}
                        <small className="text-muted d-block mb-1">
                            ${Number(producto.precio).toFixed(2)}
                        </small>

                        {/* Stock Disponible */}
                        <small className="text-muted d-block mb-2">
                            Stock Disponible: {producto.stock_Frontend}
                        </small>

                        {/* Botones de acción */}
                        <div className="d-flex flex-column gap-2">
                            {/* Botón de edición */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => navigate(`/admin/editar-producto/${producto.id}`)}
                            >
                                <i className="bi bi-pencil"></i> Editar Producto
                            </button>

                            {/* Botón de salida de stock */}
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/admin/salida-stock/${producto.id}`)} //
                                // /admin/editar-producto/:id Redirige a la página de salida de stock con el ID del producto
                            >
                                Salida Stock
                            </button>

                            {/* Botón de rellenar stock */}                            
                                <button
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => navigate(`/admin/entrada-stock/${producto.id}`)} // Redirige a la página para rellenar stock
                                >
                                    Rellenar Stock
                                </button>

                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => handleAddToCart(producto)}
                                disabled={producto.stock_Frontend <= 0} // Deshabilitar si no hay stock_Frontend
                            >
                                Añadir al Carrito
                            </button>
                        </div>
                    </div>
                ))}

                {/* Mensaje si no hay productos filtrados */}
                {filteredProductos.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666',
                            width: '100%',
                        }}
                    >
                        No se encontraron productos con los filtros seleccionados
                    </div>
                )}
            </div>
        </div>
    );
}