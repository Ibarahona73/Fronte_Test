import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getProducto, updateProducto, deleteProducto } from "../api/datos.api";
import { toast } from "react-hot-toast";
import { compressImage } from "../imageUtils";

export function Edicion() {
    const { id } = useParams(); // Obtiene el ID del producto desde la URL
    const navigate = useNavigate();
    // Inicializa react-hook-form para manejar el formulario
    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
    const [previewImages, setPreviewImages] = useState([]); // Estado para la imagen de vista previa
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado para evitar doble envío

    // Carga los datos del producto al montar o cuando cambia el id
    useEffect(() => {
        async function fetchProducto() {
            try {
                const producto = await getProducto(id); // Obtiene el producto de la API
                reset(producto); // Llena el formulario con los datos del producto
                if (producto.imagen_url) {
                    // Si hay imagen, la muestra en la vista previa
                    setPreviewImages([{ url: producto.imagen_url, name: "Imagen actual" }]);
                }
            } catch (error) {
                console.error("Error al cargar el producto:", error);
                toast.error("Error al cargar el producto");
                navigate("/inventario"); // Redirige si hay error
            }
        }
        fetchProducto();
    }, [id, reset, navigate]); // Dependencias correctas

    // Maneja el cambio de imagen seleccionada
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
                // Comprime la imagen antes de mostrarla
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
        if (newImagePreviews.length > 0) {
            setPreviewImages(newImagePreviews);
            setValue("imagenes", newImagePreviews, { shouldValidate: true });
        }
    };

    // Elimina la imagen de la vista previa
    const removeImage = () => {
        setPreviewImages([]);
        setValue("imagenes", []);
    };

    // Maneja la eliminación del producto
    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                await deleteProducto(id);
                toast.success("Producto eliminado exitosamente");
                navigate("/inventario");
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                toast.error("Error al eliminar el producto");
            }
        }
    };

    // Maneja el envío del formulario de edición
    const onSubmit = async (formData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Construye el objeto del producto a actualizar
            const productData = {
                nombre: formData.nombre.trim(),
                precio: parseFloat(formData.precio),
                cantidad_en_stock: parseInt(formData.cantidad_en_stock),
                descripcion: formData.descripcion?.trim() || '',
                categoria: formData.categoria,
                tamaño: formData.tamaño,
                colores: formData.colores,
            };

            // Si hay una nueva imagen, la agrega al objeto
            if (previewImages.length > 0 && previewImages[0].fileObject) {
                productData.imagen = previewImages[0].fileObject;
            }

            await updateProducto(id, productData); // Actualiza el producto en la API
            toast.success("Producto actualizado con éxito");
            navigate("/inventario");
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            toast.error("Error al actualizar el producto");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h4 className="mb-0">Editar Producto</h4>
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
                                            onClick={removeImage}
                                            disabled={isSubmitting}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Campos del formulario */}
                    <div className="row g-3 mb-4">
                        {/* Nombre */}
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label fw-medium">Nombre del Producto *</label>
                            <input
                                type="text"
                                id="nombre"
                                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                {...register("nombre", { required: "Este campo es requerido" })}
                                disabled={isSubmitting}
                            />
                            {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                        </div>

                        {/* Precio */}
                        <div className="col-md-6">
                            <label htmlFor="precio" className="form-label fw-medium">Precio *</label>
                            <input
                                type="number"
                                id="precio"
                                step="0.01"
                                min="0"
                                className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                                placeholder="0.00"
                                disabled={isSubmitting}
                                {...register("precio", { 
                                    required: "Este campo es requerido",
                                    min: {
                                        value: 0,
                                        message: "El precio debe ser mayor o igual a 0"
                                    },
                                    valueAsNumber: true
                                })}
                            />
                            {errors.precio && (
                                <div className="invalid-feedback">
                                    {errors.precio.message}
                                </div>
                            )}
                        </div>

                        {/* Cantidad en Stock */}
                        <div className="col-md-6">
                            <label htmlFor="cantidad_en_stock" className="form-label fw-medium">Cantidad en Stock *</label>
                            <input
                                type="number"
                                id="cantidad_en_stock"
                                className={`form-control ${errors.cantidad_en_stock ? 'is-invalid' : ''}`}
                                {...register("cantidad_en_stock", { required: "Este campo es requerido" })}
                                disabled={isSubmitting}
                            />
                            {errors.cantidad_en_stock && <div className="invalid-feedback">{errors.cantidad_en_stock.message}</div>}
                        </div>

                        {/* Categoría */}
                        <div className="col-md-6">
                            <label htmlFor="categoria" className="form-label fw-medium">Categoría *</label>
                            <select
                                id="categoria"
                                className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                {...register("categoria", { required: "Este campo es requerido" })}
                                disabled={isSubmitting}
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="H">Hombres</option>
                                <option value="M">Mujeres</option>
                            </select>
                            {errors.categoria && <div className="invalid-feedback">{errors.categoria.message}</div>}
                        </div>

                        {/* Color */}
                        <div className="col-md-6">
                            <label htmlFor="colores" className="form-label fw-medium">Color *</label>
                            <input
                                type="color"
                                id="colores"
                                className={`form-control ${errors.colores ? 'is-invalid' : ''}`}
                                {...register("colores", { required: "Este campo es requerido" })}
                                disabled={isSubmitting}
                            />
                            {errors.colores && <div className="invalid-feedback">{errors.colores.message}</div>}
                        </div>

                        {/* Tamaño */}
                        <div className="col-md-6">
                            <label htmlFor="tamaño" className="form-label fw-medium">Tamaño *</label>
                            <select
                                id="tamaño"
                                className={`form-select ${errors.tamaño ? 'is-invalid' : ''}`}
                                {...register("tamaño", { required: "Este campo es requerido" })}
                                disabled={isSubmitting}
                            >
                                <option value="">Selecciona un tamaño</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                            {errors.tamaño && <div className="invalid-feedback">{errors.tamaño.message}</div>}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                        {/* Botón para eliminar el producto */}
                        <button
                            type="button"
                            className="btn btn-outline-danger px-4"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            Eliminar Producto
                        </button>
                        {/* Botón para cancelar y volver */}
                        <button 
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={() => navigate("/admin/inventario")}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        {/* Botón para guardar cambios */}
                        <button 
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}