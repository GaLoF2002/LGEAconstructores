import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Fecha inválida");
const horaHHmm = z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:mm)");

export const crearCitaSchema = z.object({
    propiedad: objectId,
    fecha: fechaIso,
    hora: horaHHmm,
    mensaje: z.string().max(500).optional()
});

export const cambiarEstadoSchema = z.object({
    estado: z.enum(["pendiente", "aceptada", "cancelada"])
});

export const reagendarSchema = z.object({
    nuevaFecha: fechaIso,
    nuevaHora: horaHHmm
});

export const crearDisponibilidadSchema = z.object({
    diaSemana: z.enum(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]),
    horaInicio: horaHHmm,
    horaFin: horaHHmm
}).refine((d) => d.horaFin > d.horaInicio, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["horaFin"]
});
