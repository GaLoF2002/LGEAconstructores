import { z } from "zod";

// Trata las cadenas vacías ("") como "no enviado" para no romper el formulario
// (que manda password: "" cuando no se quiere cambiar).
const emptyToUndef = (schema) => z.preprocess((v) => (v === "" ? undefined : v), schema);

// Actualización de perfil propio. Todos los campos son opcionales;
// los cambios sensibles (email/contraseña) exigen `currentPassword` (validado en el controller).
export const updateProfileSchema = z.object({
    name: emptyToUndef(z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100).optional()),
    email: emptyToUndef(z.string().trim().toLowerCase().email("Ingresa un correo válido").max(254).optional()),
    phone: emptyToUndef(z.string().trim().min(7, "El teléfono debe tener al menos 7 dígitos").max(20).optional()),
    password: emptyToUndef(z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128).optional()),
    currentPassword: emptyToUndef(z.string().min(1).max(128).optional())
});
