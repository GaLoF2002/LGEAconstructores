import crypto from 'crypto';

/**
 * Autenticación por API key para servicios externos (n8n, crons, integraciones).
 * No usa la cookie JWT porque el cliente no es un navegador.
 * Se compara en tiempo constante para evitar timing attacks.
 */
export const apiKeyAuth = (req, res, next) => {
    const expected = process.env.REPORT_API_KEY;

    // Si no hay clave configurada, el recurso queda deshabilitado (fail closed).
    if (!expected) {
        return res.status(503).json({ msg: 'Servicio de reportes deshabilitado: falta REPORT_API_KEY en el servidor.' });
    }

    const provided = req.get('x-api-key') || '';

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!ok) {
        req.log?.warn({ event: 'apikey_invalid', ip: req.ip }, 'API key inválida');
        return res.status(401).json({ msg: 'API key inválida' });
    }

    next();
};
