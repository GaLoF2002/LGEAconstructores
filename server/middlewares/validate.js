// Middleware genérico de validación con zod.
// Uso:
//   import { z } from 'zod';
//   const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
//   router.post('/x', validate(schema), handler);
//
// Reemplaza req.body por la versión parseada (con tipos coercionados).
export const validate = (schema, source = "body") => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        return res.status(400).json({
            error: "Datos inválidos",
            details: result.error.errors.map(e => ({
                path: e.path.join("."),
                message: e.message
            }))
        });
    }
    req[source] = result.data;
    next();
};
