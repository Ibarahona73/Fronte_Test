import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#a21d22' }}>
            <div className="container-fluid">
                <Link className="navbar-brand text-white" to="/">Tienda Online</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/">Inicio</Link>
                        </li>
                        {/* Ocultar otros botones si estás en VisualProducto */}
                        {location.pathname === '/' ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/inventario">Inventario</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/ventas-create">Crear Venta</Link>
                                </li>
                            </>
                        ) : null}
                    </ul>
                </div>
            </div>
        </nav>
    );
}