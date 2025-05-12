// utils/imageUtils.js

/**
 * Comprime una imagen antes de subirla
 * @param {File} file - Archivo de imagen a comprimir
 * @param {number} maxWidth - Ancho máximo en píxeles (default: 800)
 * @param {number} quality - Calidad de compresión (0.1 a 1.0, default: 0.7)
 * @returns {Promise<File>} - Archivo comprimido
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Error al comprimir la imagen'));
                            return;
                        }
                        
                        // Convertir el Blob a File
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = event.target.result;
        };
        
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
};

/**
 * Convierte un File a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} - Cadena Base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Extraer solo la parte de datos (remover el prefijo data:image/...)
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};