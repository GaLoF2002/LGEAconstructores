import rateLimit from "express-rate-limit";

// Límite global de defensa: 300 req cada 15 min por IP (cubre toda la API).
// Holgado para uso normal; frena scraping/DoS básico. Auth tiene límites más estrictos aparte.
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas peticiones. Intenta nuevamente más tarde." }
});

// Endpoints sensibles de auth: 5 intentos cada 15 min por IP.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Intenta nuevamente en 15 minutos." }
});

// Registro: 10 cuentas por IP por hora.
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados registros desde esta IP. Intenta más tarde." }
});

// Reset password: 5 intentos por IP por hora (token endurece, no IP).
export const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Intenta más tarde." }
});
