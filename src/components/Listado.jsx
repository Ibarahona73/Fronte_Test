import { useEffect, useState } from "react";
import { getProductos } from "../api/datos.api";

export function Listado() {
    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        async function cargaProductos() {
            try {
                const res = await getProductos();
                if (!isMounted) return;
                
                console.log("Datos de imágenes:", res.map(p => p.imagen));
                
                // Transformar URLs relativas a absolutas si es necesario
                const productosConImagenes = res.map(producto => ({
                    ...producto,
                    imagen: producto.imagen?.startsWith('http') 
                        ? producto.imagen 
                        : `http://tiendaonline-backend-yaoo.onrender.com${producto.imagen}`
                }));
                
                setProductos(productosConImagenes);
            } catch (error) {
                console.error("Error:", error);
                setError("Error al cargar productos");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        
        cargaProductos();
        
        return () => { isMounted = false; };
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {productos.length > 0 ? (
                productos.map(producto => (
                    <div key={producto.id} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '8px',
                        width: '300px'
                    }}>
                        <h3>{producto.nombres || producto.nombre || 'Sin nombre'}</h3>
                        
                        {/* Componente de imagen mejorado */}
                        <div style={{
                            height: '200px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            marginBottom: '10px'
                        }}>
                            <img 
                                src={producto.imagen} 
                                alt={producto.nombres || 'Producto'} 
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                 //   e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                                }}
                            />
                        </div>
                        
                        <p><strong>Precio:</strong> ${producto.precio}</p>
                        <p><strong>Stock:</strong> {producto.cantidad_en_stock}</p>
                        <p><strong>Color:</strong> {producto.colores}</p>
                        <p><strong>Tamaño:</strong> {producto.tamaño}</p>
                    </div>
                ))
            ) : (
                <div>No hay productos disponibles</div>
            )}
        </div>
    );
}