// Validador de variables de entorno. Importar y llamar al inicio de server.js.
// Falla rápido si falta cualquier variable obligatoria.
import dotenv from "dotenv";
dotenv.config();

const REQUIRED = [
    "MONGO_URI",
    "JWT_SECRET",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD",
    "CLOUDINARY_KEY",
    "CLOUDINARY_SECRET"
];

// Opcionales: si faltan, el server arranca igual pero la función queda deshabilitada.
const OPTIONAL_EMAIL = ["GMAIL_USER", "GMAIL_PASS"];

export function assertEnv() {
    const missing = REQUIRED.filter((k) => !process.env[k]);
    if (missing.length) {
        console.error(`✗ Faltan variables de entorno: ${missing.join(", ")}`);
        process.exit(1);
    }
    if (process.env.JWT_SECRET.length < 32) {
        console.error("✗ JWT_SECRET debe tener al menos 32 caracteres.");
        process.exit(1);
    }
    if (OPTIONAL_EMAIL.some((k) => !process.env[k])) {
        console.warn("⚠️  GMAIL_USER/GMAIL_PASS no configurados: 'Recuperar contraseña' no enviará correos.");
    }
}
