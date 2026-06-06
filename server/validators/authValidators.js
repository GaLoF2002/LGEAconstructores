import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z.string().trim().toLowerCase().email("Ingresa un correo válido").max(254),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
    phone: z.string().trim().min(7, "El teléfono debe tener al menos 7 dígitos").max(20, "El teléfono no puede superar 20 dígitos")
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128)
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254)
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8).max(128)
});
