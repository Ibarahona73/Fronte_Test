import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createProducto } from "../api/datos.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import React from 'react';

export function CrearInvPedido() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        setValue, 
        getValues,
        watch
    } = useForm({
        defaultValues: {
            colores: "#ffffff" // Valor inicial válido
        }
    });
    
    const navigate = useNavigate();
    const [previewImages, setPreviewImages] = useState([]);
    const selectedColor = watch("colores");

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setPreviewImages(imagePreviews);
        setValue("imagenes", files, { shouldValidate: true });
    };

    const handleColorChange = (e) => {
        const hexColor = e.target.value;
        // Validación básica del formato hexadecimal
        if (/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
            setValue("colores", hexColor, { shouldValidate: true });
        }
    };

    const onSubmit = async (data) => {
        try {
            // Validación adicional del color hexadecimal
            if (!/^#[0-9A-Fa-f]{6}$/.test(data.colores)) {
                toast.error("Por favor ingrese un color hexadecimal válido (ej. #FF0000)");
                return;
            }

            // Validación de categoría
            if (!data.categoria || (data.categoria !== 'H' && data.categoria !== 'M')) {
                toast.error("Seleccione una categoría válida (Hombres o Mujeres)");
                return;
            }

            const formData = new FormData();
            
            // Agregar campos básicos
            formData.append('nombre', data.nombre);
            formData.append('precio', parseFloat(data.precio));
            formData.append('cantidad_en_stock', parseInt(data.cantidad_en_stock));
            formData.append('descripcion', data.descripcion);
            formData.append('categoria', data.categoria);
            formData.append('tamaño', data.tamaño);
            formData.append('colores', data.colores);
            
            // Agregar imágenes
            const imagenes = getValues("imagenes");
            if (imagenes && imagenes.length > 0) {
                for (let i = 0; i < imagenes.length; i++) {
                    formData.append('imagen', imagenes[i]);
                }
            }

            const response = await createProducto(formData);
            
            if (response.status === 201) {
                toast.success("Producto creado con éxito");
                navigate("/inventario");
            } else {
                toast.error("Error al crear el producto");
            }
        } catch (error) {
            console.error("Error al crear el producto:", error);
            let errorMessage = "Error al crear el producto";
            
            if (error.response?.data) {
                // Manejo específico de errores del backend
                if (error.response.data.categoria) {
                    errorMessage = error.response.data.categoria.join(', ');
                } else if (error.response.data.colores) {
                    errorMessage = error.response.data.colores.join(', ');
                }
            }
            
            toast.error(errorMessage);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h4 className="mb-0">Crear Nuevo Producto</h4>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                    {/* Sección de imágenes */}
                    <div className="mb-4">
                        <h5 className="mb-3 fw-semibold">Imágenes del Producto</h5>
                        <div className="border rounded p-3 bg-light">
                            <input
                                type="file"
                                id="imagenes"
                                className="d-none"
                                multiple
                                accept="image/*"
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
                        {errors.imagenes && (
                            <div className="text-danger small mt-1">
                                {errors.imagenes.message || "Debes añadir al menos una imagen"}
                            </div>
                        )}
                    </div>

                    {/* Campos del formulario */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label fw-medium">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                placeholder="Nombre del producto"
                                {...register("nombre", { 
                                    required: "Este campo es requerido",
                                    minLength: {
                                        value: 3,
                                        message: "Mínimo 3 caracteres"
                                    }
                                })}
                            />
                            {errors.nombre && (
                                <div className="invalid-feedback">
                                    {errors.nombre.message}
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="precio" className="form-label fw-medium">
                                Precio *
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                    type="number"
                                    id="precio"
                                    step="0.01"
                                    className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                    {...register("precio", { 
                                        required: "Este campo es requerido",
                                        min: {
                                            value: 0.01,
                                            message: "El precio debe ser mayor a 0"
                                        }
                                    })}
                                />
                            </div>
                            {errors.precio && (
                                <div className="invalid-feedback">
                                    {errors.precio.message}
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="cantidad_en_stock" className="form-label fw-medium">
                                Cantidad en Stock *
                            </label>
                            <input
                                type="number"
                                id="cantidad_en_stock"
                                className={`form-control ${errors.cantidad_en_stock ? 'is-invalid' : ''}`}
                                placeholder="0"
                                {...register("cantidad_en_stock", { 
                                    required: "Este campo es requerido",
                                    min: {
                                        value: 0,
                                        message: "La cantidad no puede ser negativa"
                                    }
                                })}
                            />
                            {errors.cantidad_en_stock && (
                                <div className="invalid-feedback">
                                    {errors.cantidad_en_stock.message}
                                </div>
                            )}
                        </div>

                        <div className="col-12">
                            <label htmlFor="descripcion" className="form-label fw-medium">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                rows="3"
                                className="form-control"
                                placeholder="Descripción detallada del producto"
                                {...register("descripcion")}
                            ></textarea>
                        </div>

                        {/* Campo de categoría corregido */}
                        <div className="col-md-6">
                            <label htmlFor="categoria" className="form-label fw-medium">
                                Categoría *
                            </label>
                            <select
                                id="categoria"
                                className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                {...register("categoria", { 
                                    required: "Este campo es requerido",
                                    validate: value => value === 'H' || value === 'M' || "Seleccione una categoría válida"
                                })}
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="H">Hombres</option>
                                <option value="M">Mujeres</option>
                            </select>
                            {errors.categoria && (
                                <div className="invalid-feedback">
                                    {errors.categoria.message}
                                </div>
                            )}
                        </div>

                        {/* Campo de color hexadecimal corregido */}
                        <div className="col-md-6">
                            <label htmlFor="colores" className="form-label fw-medium">
                                Color (Hexadecimal) *
                            </label>
                            <div className="d-flex align-items-center gap-3">
                                <input
                                    type="color"
                                    id="color-picker"
                                    className="form-control form-control-color"
                                    value={selectedColor}
                                    onChange={handleColorChange}
                                    title="Elige un color"
                                />
                                <input
                                    type="text"
                                    id="colores"
                                    className={`form-control ${errors.colores ? 'is-invalid' : ''}`}
                                    value={selectedColor}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                            setValue("colores", value, { shouldValidate: true });
                                        }
                                    }}
                                    {...register("colores", { 
                                        required: "Color es requerido",
                                        pattern: {
                                            value: /^#[0-9A-Fa-f]{6}$/,
                                            message: "Formato hexadecimal inválido (ej. #FF0000)"
                                        }
                                    })}
                                />
                                <div 
                                    className="color-preview"
                                    style={{
                                        backgroundColor: selectedColor,
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6'
                                    }}
                                ></div>
                            </div>
                            {errors.colores && (
                                <div className="invalid-feedback d-block">
                                    {errors.colores.message}
                                </div>
                            )}
                            <small className="text-muted">Formato: #RRGGBB (ej. #FF0000 para rojo)</small>
                        </div>

                        {/* Campo de tamaño */}
                        <div className="col-md-6">
                            <label htmlFor="tamaño" className="form-label fw-medium">
                                Tamaño *
                            </label>
                            <select
                                id="tamaño"
                                className={`form-select ${errors.tamaño ? 'is-invalid' : ''}`}
                                {...register("tamaño", { 
                                    required: "Este campo es requerido"
                                })}
                            >
                                <option value="">Selecciona un tamaño</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                            {errors.tamaño && (
                                <div className="invalid-feedback">
                                    {errors.tamaño.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Galería de imágenes */}
                    {previewImages.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3 fw-semibold">Vista previa de imágenes</h5>
                            <div className="d-flex flex-wrap gap-3">
                                {previewImages.map((image, index) => (
                                    <div key={index} className="position-relative" style={{ width: '120px', height: '120px' }}>
                                        <img 
                                            src={image.url} 
                                            alt={image.name}
                                            className="img-thumbnail w-100 h-100 object-fit-cover"
                                            style={{ objectFit: 'contain' }}
                                        />
                                        <button 
                                            type="button"
                                            className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle m-1"
                                            onClick={() => {
                                                const updatedImages = previewImages.filter((_, i) => i !== index);
                                                setPreviewImages(updatedImages);
                                                const currentFiles = getValues("imagenes") || [];
                                                setValue("imagenes", currentFiles.filter((_, i) => i !== index));
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
                    <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                        <button 
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={() => navigate("/inventario")}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary px-4"
                        >
                            <i className="bi bi-save me-2"></i>
                            Guardar Producto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}