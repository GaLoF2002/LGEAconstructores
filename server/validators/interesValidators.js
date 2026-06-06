import { z } from "zod";

export const marcarInteresSchema = z.object({
    propiedadId: z.string().regex(/^[a-f\d]{24}$/i, "ID de propiedad inválido")
});
