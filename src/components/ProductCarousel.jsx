import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';

export function ProductCarousel({ products }) {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
    };

    if (!products || products.length === 0) {
        return null; // No renderizar nada si no hay productos
    }

    return (
        <div style={{ marginBottom: '40px', width: '100%' }}>
            <Slider {...settings}>
                {products.map(product => (
                    <div key={product.id}>
                        <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                position: 'relative',
                                height: '400px',
                                backgroundImage: `url(${product.imagen})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center center',
                                backgroundSize: 'contain',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 10%, rgba(0, 0, 0, 0) 50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '40px',
                                    color: 'white'
                                }}>
                                    <div style={{ maxWidth: '500px' }}>
                                        <h2 style={{ 
                                            margin: '0 0 10px 0', 
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '2.2rem',
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                                        }}>
                                            {product.nombre}
                                        </h2>
                                        <p style={{ 
                                            margin: '0 0 15px 0', 
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '1rem',
                                            lineHeight: '1.5',
                                            maxWidth: '90%',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                        }}>
                                            Descubre nuestras ofertas exclusivas en productos de alta calidad. ¡No te lo pierdas!
                                        </p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1.8rem',
                                            fontWeight: 'bold',
                                            fontFamily: 'Poppins, sans-serif',
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                                        }}>
                                            ${Number(product.precio).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </div>
    );
} 