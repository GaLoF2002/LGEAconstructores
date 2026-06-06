// Manejador central de errores. Va al FINAL de la cadena de middlewares.
//
// Captura:
// - ZodError → 400 con detalles legibles.
// - CastError (Mongoose, ej. ObjectId malformado) → 400.
// - ValidationError (Mongoose) → 400.
// - Errores con .status numérico → ese status.
// - Cualquier otra cosa → 500 genérico (no se filtra mensaje al cliente).

export const notFound = (req, res, next) => {
    res.status(404).json({ error: "Recurso no encontrado" });
};

export const errorHandler = (err, req, res, next) => {
    // Si ya se envió respuesta, delega al handler default.
    if (res.headersSent) return next(err);

    // Log estructurado si pino está disponible, fallback a console.
    if (req.log?.error) {
        req.log.error({ err, path: req.path }, "request error");
    } else {
        console.error(`[${req.method} ${req.path}]`, err);
    }

    // Zod
    if (err.name === "ZodError") {
        return res.status(400).json({
            error: "Datos inválidos",
            details: err.errors?.map(e => ({ path: e.path.join("."), message: e.message }))
        });
    }

    // Mongoose
    if (err.name === "CastError") {
        return res.status(400).json({ error: "Identificador inválido" });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ error: "Datos inválidos" });
    }

    // Errores con status explícito
    if (typeof err.status === "number") {
        return res.status(err.status).json({ error: err.message || "Error" });
    }

    // Fallback
    res.status(500).json({ error: "Error interno del servidor" });
};
