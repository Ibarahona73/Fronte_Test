import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createProducto, deleteProducto } from "../api/datos.api";
import { toast } from "react-hot-toast";
import { compressImage } from "../imageUtils";

export function CrearInvPedido() {
    // Inicializa react-hook-form para manejar el formulario
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        setValue, 
        getValues,
        watch,
        reset
    } = useForm({
        defaultValues: {
            colores: "#ffffff",
            cantidad_en_stock: 0,
            precio: 0.00
        }
    });
    
    const navigate = useNavigate();
    const [previewImages, setPreviewImages] = useState([]); // Estado para las imágenes seleccionadas
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado para evitar doble envío
    const [productos, setProductos] = useState([]); // Estado para productos (no usado aquí)
    const selectedColor = watch("colores"); // Observa el color seleccionado

    // Maneja el cambio de imágenes seleccionadas
    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImagePreviews = [];
        for (const file of files) {
            if (!file.type.match('image.*')) {
                toast.error(`El archivo ${file.name} no es una imagen válida`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`La imagen ${file.name} es demasiado grande (máximo 5MB)`);
                continue;
            }
            try {
                const compressedFile = await compressImage(file, 1024, 0.7);                
                newImagePreviews.push({
                    name: file.name,
                    url: URL.createObjectURL(compressedFile),                    
                    fileObject: compressedFile
                });
            } catch (error) {
                toast.error(`Error al procesar ${file.name}: ${error.message}`);
            }
        }
        setPreviewImages(newImagePreviews);
        setValue("imagenes", newImagePreviews, { shouldValidate: true });
    };

    // Convierte un archivo a base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]); // Solo la parte base64
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // Elimina una imagen de la vista previa
    const removeImage = (index) => {
        const updatedImages = previewImages.filter((_, i) => i !== index);
        setPreviewImages(updatedImages);
        setValue("imagenes", updatedImages);
    };

    // Maneja el envío del formulario
    const onSubmit = async (formData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Valida que haya al menos una imagen
            if (previewImages.length === 0) {
                toast.error("Debes seleccionar al menos una imagen");
                setIsSubmitting(false);
                return;
            }

            const dataToSend = new FormData();
            dataToSend.append('nombre', formData.nombre.trim());
            dataToSend.append('precio', parseFloat(formData.precio));
            dataToSend.append('cantidad_en_stock', parseInt(formData.cantidad_en_stock));
            dataToSend.append('desc_prod', formData.descripcion?.trim() || '');
            dataToSend.append('categoria', formData.categoria);
            dataToSend.append('tamano', formData.tamano);
            dataToSend.append('colores', formData.colores);

            // Asegúrate de que el backend espera el campo de imagen como 'imagen'
            if (previewImages[0] && previewImages[0].fileObject) {
                dataToSend.append('imagen', previewImages[0].fileObject);
            }
            

            // Llama a la API para crear el producto
            await createProducto(dataToSend);
            toast.success("Producto creado exitosamente");
            reset(); // Limpia el formulario
            setPreviewImages([]); // Limpia las imágenes
            navigate("/inventario"); // Redirige al inventario
        } catch (error) {
            console.error("Error al crear el producto:", error);
            toast.error("Error al crear el producto");
        } finally {
            setIsSubmitting(false);
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
                        <h5 className="mb-3 fw-semibold">Imagen del Producto</h5>
                        <div className="border rounded p-3 bg-light">
                            <input
                                type="file"
                                id="imagen-upload"
                                className="d-none"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isSubmitting}
                            />
                            <label 
                                htmlFor="imagen-upload" 
                                className="d-block text-center cursor-pointer py-3"
                            >
                                <div className="d-flex flex-column align-items-center justify-content-center">
                                    <i className="bi bi-image fs-1 text-muted mb-2"></i>
                                    <p className="text-muted mb-0">Haz clic para seleccionar una imagen</p>
                                    <small className="text-muted">Formatos: JPG, PNG (Máx. 5MB)</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Vista previa de imagen */}
                    {previewImages.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3 fw-semibold">Vista previa</h5>
                            <div className="d-flex flex-wrap gap-3">
                                {previewImages.map((image, index) => (
                                    <div key={index} className="position-relative" style={{ width: '120px', height: '120px' }}>
                                        <img 
                                            src={image.url} 
                                            alt={image.name}
                                            className="img-thumbnail w-100 h-100 object-fit-cover"
                                            style={{ objectFit: 'contain' }}
                                        />
                                        {/* Botón para eliminar la imagen */}
                                        <button 
                                            type="button"
                                            className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle m-1"
                                            onClick={() => removeImage(index)}
                                            disabled={isSubmitting}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                        {/* Nombre y tamaño de la imagen */}
                                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-1 small">
                                            {image.name.substring(0, 15)}{image.name.length > 15 ? '...' : ''}
                                            <br />
                                            {(image.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Campos del formulario */}
                    <div className="row g-3 mb-4">
                        {/* Nombre */}
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label fw-medium">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                placeholder="Nombre del producto"
                                disabled={isSubmitting}
                                {...register("nombre", { 
                                    required: "Este campo es requerido",
                                    minLength: {
                                        value: 3,
                                        message: "Mínimo 3 caracteres"
                                    },
                                    maxLength: {
                                        value: 255,
                                        message: "Máximo 255 caracteres"
                                    }
                                })}
                            />
                            {errors.nombre && (
                                <div className="invalid-feedback">
                                    {errors.nombre.message}
                                </div>
                            )}
                        </div>

                        {/* Precio */}
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
                                    min="0.01"
                                    className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                    disabled={isSubmitting}
                                    {...register("precio", { 
                                        required: "Este campo es requerido",
                                        min: {
                                            value: 0.01,
                                            message: "El precio debe ser mayor a 0"
                                        },
                                        valueAsNumber: true
                                    })}
                                />
                            </div>
                            {errors.precio && (
                                <div className="invalid-feedback">
                                    {errors.precio.message}
                                </div>
                            )}
                        </div>

                        {/* Cantidad en Stock */}
                        <div className="col-md-6">
                            <label htmlFor="cantidad_en_stock" className="form-label fw-medium">
                                Cantidad en Stock *
                            </label>
                            <input
                                type="number"
                                id="cantidad_en_stock"
                                min="0"
                                className={`form-control ${errors.cantidad_en_stock ? 'is-invalid' : ''}`}
                                placeholder="0"
                                disabled={isSubmitting}
                                {...register("cantidad_en_stock", { 
                                    required: "Este campo es requerido",
                                    min: {
                                        value: 0,
                                        message: "La cantidad no puede ser negativa"
                                    },
                                    valueAsNumber: true
                                })}
                            />
                            {errors.cantidad_en_stock && (
                                <div className="invalid-feedback">
                                    {errors.cantidad_en_stock.message}
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="col-12">
                            <label htmlFor="descripcion" className="form-label fw-medium">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                rows="3"
                                className="form-control"
                                placeholder="Descripción detallada del producto"
                                disabled={isSubmitting}
                                {...register("descripcion", {
                                    maxLength: {
                                        value: 1000,
                                        message: "Máximo 1000 caracteres"
                                    }
                                })}
                            ></textarea>
                            {errors.descripcion && (
                                <div className="invalid-feedback d-block">
                                    {errors.descripcion.message}
                                </div>
                            )}
                        </div>

                        {/* Categoría */}
                        <div className="col-md-6">
                            <label htmlFor="categoria" className="form-label fw-medium">
                                Categoría *
                            </label>
                            <select
                                id="categoria"
                                className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                disabled={isSubmitting}
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

                        {/* Color */}
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
                                    onChange={(e) => {
                                        setValue("colores", e.target.value, { shouldValidate: true });
                                    }}
                                    disabled={isSubmitting}
                                />
                                <input
                                    type="text"
                                    id="colores"
                                    className={`form-control ${errors.colores ? 'is-invalid' : ''}`}
                                    disabled={isSubmitting}
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

                        {/* Tamaño */}
                        <div className="col-md-6">
                            <label htmlFor="tamano" className="form-label fw-medium">
                                Tamaño *
                            </label>
                            <select
                                id="tamano"
                                className={`form-select ${errors.tamano ? 'is-invalid' : ''}`}
                                disabled={isSubmitting}
                                {...register("tamano", { 
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
                            {errors.tamano && (
                                <div className="invalid-feedback">
                                    {errors.tamano.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                        <button 
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={() => navigate("/inventario")}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-save me-2"></i>
                                    Guardar Producto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}