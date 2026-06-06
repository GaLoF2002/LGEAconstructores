// config/uploadConfig.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import "dotenv/config";

// Si usas CLOUDINARY_URL, con esto ya basta (pero lo pongo explícito también):
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,   // o usa solo CLOUDINARY_URL
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

/* ============ Storage para IMÁGENES ============ */
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Validación equivalente a tu fileFilter de imágenes
        if (!file.mimetype?.startsWith("image/")) {
            throw new Error("Solo se permiten archivos de imagen.");
        }
        return {
            folder: "mi-app/imagenes",            // cambia si quieres
            resource_type: "image",
            overwrite: false,
            // Opcional: optimización automática
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            public_id: `${Date.now()}-${file.fieldname}`,
        };
    },
});

/* ============ Storage para PDFs (Evaluaciones) ============
 * Los PDFs se suben como `type: "authenticated"`, lo que obliga a usar
 * URLs firmadas para descargarlos. La URL pública devuelve 401.
 * El controller debe guardar `file.filename` (public_id), no `file.path`.
 */
const pdfStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        if (file.mimetype !== "application/pdf") {
            throw new Error("Solo se permiten PDFs en evaluaciones.");
        }
        return {
            folder: "mi-app/evaluaciones",
            resource_type: "raw",
            type: "authenticated",
            format: "pdf",
            overwrite: false,
            public_id: `${Date.now()}-${crypto.randomUUID()}`,
        };
    },
});

/* ============ Middlewares Multer ============ */
// Comportamiento por defecto (como tu 'upload' original) → imágenes
const uploadImages = multer({
    storage: imageStorage,
    limits: { files: 10, fileSize: 5 * 1024 * 1024 }, // 10 archivos, 5MB c/u
});

// Evaluaciones (PDFs) — middleware crudo
export const uploadEvaluaciones = multer({
    storage: pdfStorage,
    limits: { files: 2, fileSize: 5 * 1024 * 1024 }, // máx 2 PDFs, 5MB c/u
});

// Middleware listo para usar en la ruta de evaluación-compra:
//   router.post("/evaluacion-compra", auth, uploadEvaluacion, crearEvaluacionCompra)
export const uploadEvaluacion = uploadEvaluaciones.array("documentos", 2);

// Manejador de errores de Multer + Cloudinary (formato JSON consistente).
export const multerErrors = (err, req, res, next) => {
    if (!err) return next();

    // Validaciones de archivo (tipo/cantidad/tamaño) → 400 con mensaje claro.
    if (err.name === "MulterError" || /Solo se permiten|Solo imágenes|Solo PDFs/i.test(err.message || "")) {
        return res.status(400).json({ ok: false, msg: err.message });
    }

    // Errores de configuración / autenticación de Cloudinary → mensaje accionable.
    const cloudinaryMsg = err.error?.message || err.message || "";
    if (err.http_code === 401 || /cloud_name mismatch|unknown api_key|Invalid Signature|api_key/i.test(cloudinaryMsg)) {
        console.error("Cloudinary mal configurado:", cloudinaryMsg);
        return res.status(500).json({
            ok: false,
            msg: "Error de configuración del almacenamiento de imágenes (Cloudinary). Revisa CLOUDINARY_CLOUD, CLOUDINARY_KEY y CLOUDINARY_SECRET en el servidor."
        });
    }

    next(err);
};

// Export default: middleware de imágenes (backward-compatible)
export default uploadImages;
