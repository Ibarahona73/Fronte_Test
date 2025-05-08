import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createProducto } from "../api/datos.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import React from 'react'

export function CrearInvPedido() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const [previewImages, setPreviewImages] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setPreviewImages(imagePreviews);
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            formData.append('nombre', data.nombre);
            formData.append('precio', data.precio);
            formData.append('cantidad_en_stock', data.cantidad_en_stock);
            formData.append('descripcion', data.descripcion);
            
            if (data.imagenes && data.imagenes.length > 0) {
                Array.from(data.imagenes).forEach((file, index) => {
                    formData.append(`imagen_${index}`, file);
                });
            }

            await createProducto(formData);
            toast.success("Producto creado con éxito");
            navigate("/inventario");
        } catch (error) {
            console.error("Error al crear el producto:", error);
            toast.error("Error al crear el producto");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h4 className="mb-0">Añadir imágenes a este producto</h4>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                    {/* Sección de imágenes */}
                    <div className="mb-4">
                        <h5 className="mb-3 fw-semibold">Añadir Imágenes</h5>
                        <div className="border rounded p-3 bg-light">
                            <input
                                type="file"
                                id="imagenes"
                                className="d-none"
                                multiple
                                accept="image/*"
                                {...register("imagenes", { required: true })}
                                onChange={handleImageChange}
                            />
                            <label htmlFor="imagenes" className="d-block text-center cursor-pointer py-3">
                                <div className="d-flex flex-column align-items-center justify-content-center">
                                    <i className="bi bi-images fs-1 text-muted mb-2"></i>
                                    <p className="text-muted mb-0">Haz clic para seleccionar imágenes</p>
                                    <small className="text-muted">o arrastra y suelta aquí</small>
                                </div>
                            </label>
                        </div>
                        {errors.imagenes && <div className="text-danger small mt-1">Debes añadir al menos una imagen</div>}
                    </div>

                    {/* Campos del formulario */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label fw-medium">Nombre del Producto</label>
                            <input
                                type="text"
                                id="nombre"
                                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                placeholder="Nombre del producto"
                                {...register("nombre", { required: true })}
                            />
                            {errors.nombre && <div className="invalid-feedback">Este campo es requerido</div>}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="precio" className="form-label fw-medium">Precio del Producto</label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                    type="number"
                                    id="precio"
                                    step="0.01"
                                    className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                    {...register("precio", { required: true, min: 0 })}
                                />
                            </div>
                            {errors.precio && <div className="invalid-feedback">Precio inválido</div>}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="cantidad" className="form-label fw-medium">Cantidad en Stock</label>
                            <input
                                type="number"
                                id="cantidad"
                                className={`form-control ${errors.cantidad_en_stock ? 'is-invalid' : ''}`}
                                placeholder="0"
                                {...register("cantidad_en_stock", { required: true, min: 0 })}
                            />
                            {errors.cantidad_en_stock && <div className="invalid-feedback">Cantidad inválida</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="descripcion" className="form-label fw-medium">Descripción del producto</label>
                            <textarea
                                id="descripcion"
                                rows="3"
                                className="form-control"
                                placeholder="Descripción detallada del producto"
                                {...register("descripcion")}
                            ></textarea>
                        </div>
                    </div>

                    {/* Galería de imágenes */}
                    {previewImages.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3 fw-semibold">Galería del producto</h5>
                            <div className="d-flex flex-wrap gap-3">
                                {previewImages.map((image, index) => (
                                    <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                        <img 
                                            src={image.url} 
                                            alt={image.name}
                                            className="img-thumbnail w-100 h-100 object-fit-cover"
                                        />
                                        <button 
                                            type="button"
                                            className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle m-1"
                                            onClick={() => {
                                                setPreviewImages(previewImages.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button 
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/inventario")}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                        >
                            Crear Producto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}