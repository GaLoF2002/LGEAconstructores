import { z } from "zod";

const tipoEnum = z.enum(["casa", "departamento", "terreno"]);
const estadoEnum = z.enum(["disponible", "reservado", "vendido"]);

// "", undefined → undefined ; "x" → ["x"] ; ["a","b"] → ["a","b"]
const toArray = (v) => {
    if (v === undefined || v === null || v === "") return undefined;
    return Array.isArray(v) ? v : [v];
};
const caracteristicas = z.preprocess(toArray, z.array(z.string().max(120)).max(50).optional());

// Crear: multipart (los números llegan como string → z.coerce). Las imágenes van por multer (no aquí).
export const crearPropiedadSchema = z.object({
    titulo: z.string().trim().min(1, "El título es obligatorio").max(200),
    descripcion: z.string().max(5000).optional(),
    precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
    ubicacion: z.string().trim().min(1, "La ubicación es obligatoria").max(300),
    metrosCuadrados: z.coerce.number().nonnegative(),
    parqueaderos: z.coerce.number().nonnegative(),
    habitaciones: z.coerce.number().nonnegative(),
    banos: z.coerce.number().nonnegative(),
    tipo: tipoEnum,
    estado: estadoEnum.optional(),
    caracteristicas
});

// Actualizar: edición parcial vía JSON. Todo opcional; `imagenes` se ignora (las nuevas irían por multer).
export const actualizarPropiedadSchema = z.object({
    titulo: z.string().trim().min(1).max(200).optional(),
    descripcion: z.string().max(5000).optional(),
    precio: z.coerce.number().nonnegative().optional(),
    ubicacion: z.string().trim().min(1).max(300).optional(),
    metrosCuadrados: z.coerce.number().nonnegative().optional(),
    parqueaderos: z.coerce.number().nonnegative().optional(),
    habitaciones: z.coerce.number().nonnegative().optional(),
    banos: z.coerce.number().nonnegative().optional(),
    tipo: tipoEnum.optional(),
    estado: estadoEnum.optional(),
    caracteristicas,
    imagenes: z.any().optional()
});
