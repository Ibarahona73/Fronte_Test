import { useEffect, useState } from "react";
import { getProductos } from "../api/datos.api";
import { Navigation } from './Navigation';

export function Listado() {
    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'https://tiendaonline-backend-yaoo.onrender.com';

    useEffect(() => {
        let isMounted = true;
        
        async function cargaProductos() {
            try {
                const res = await getProductos();
                if (!isMounted) return;
                
                const productosConImagenes = res.map(producto => ({
                    ...producto,
                    imagen: producto.imagen 
                        ? (producto.imagen.startsWith('http') 
                            ? producto.imagen 
                            : `${API_BASE_URL}${producto.imagen}`)
                        : null
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

    if (loading) return (
        <div>            
            <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                fontSize: '1.2rem'
            }}>
                Cargando productos...
            </div>
        </div>
    );
    
    if (error) return (
        <div>            
            <div style={{ 
                padding: '40px', 
                color: 'red', 
                textAlign: 'center',
                fontSize: '1.2rem'
            }}>
                {error}
            </div>
        </div>
    );

    return (
        <div>            
            <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                padding: '30px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {productos.map(producto => (
                    <div key={producto.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        gap: '30px',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '5px',
                            overflow: 'hidden'
                        }}>
                            {producto.imagen ? (
                                <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;                                         
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#999' }}>Sin imagen</span>
                            )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <h3 style={{ 
                                margin: '0 0 10px 0',
                                fontSize: '1.4rem',
                                color: '#333'
                            }}>
                                {producto.nombre || 'Producto sin nombre'}
                            </h3>
                            
                            <div style={{ 
                                display: 'flex',
                                gap: '30px',
                                marginBottom: '10px'
                            }}>
                                <div>
                                    <span style={{
                                        display: 'block',
                                        color: '#666',
                                        marginBottom: '5px'
                                    }}>Precio:</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: '#2c3e50',
                                        fontSize: '1.2rem'
                                    }}>${producto.precio}</span>
                                </div>
                                
                                <div>
                                    <span style={{
                                        display: 'block',
                                        color: '#666',
                                        marginBottom: '5px'
                                    }}>Stock:</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: producto.cantidad_en_stock > 0 ? '#27ae60' : '#e74c3c'
                                    }}>
                                        {producto.cantidad_en_stock}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {producto.tamaño && (
                                    <span style={{
                                        backgroundColor: '#e0e0e0',
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.9rem'
                                    }}>
                                        Talla: {producto.tamaño}
                                    </span>
                                )}
                                
                                {producto.colores && (
                                    <span style={{
                                        backgroundColor: '#e0e0e0',
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.9rem'
                                    }}>
                                        Color: {producto.colores}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}