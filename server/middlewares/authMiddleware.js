import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // Preferimos la cookie httpOnly; el header Bearer queda como fallback
        // (clientes API / Postman / compatibilidad).
        const authHeader = req.headers.authorization;
        const token =
            req.cookies?.token ||
            (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

        if (!token) {
            return res.status(401).json({ msg: "No autorizado, token no encontrado o malformado" });
        }

        // Verificar que la clave secreta esté definida
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: "Error interno: JWT_SECRET no definido en el entorno" });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario en la base de datos
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ msg: "No autorizado, usuario no encontrado" });
        }

        // Validar que el JWT no haya sido invalidado por logout / cambio de password.
        const tokenVersion = decoded.tv ?? 0;
        if ((user.tokenVersion ?? 0) !== tokenVersion) {
            return res.status(401).json({ msg: "Sesión expirada, inicia sesión nuevamente" });
        }

        // Asignar el usuario a la solicitud
        req.user = user;
        next();
    } catch (error) {
        // Token expirado es flujo normal; no se loguea como evento de seguridad.
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token expirado, inicia sesión nuevamente" });
        }

        // Firma inválida u otro error → posible manipulación: evento de seguridad.
        req.log?.warn({ event: "auth_invalid_token", reason: error.name, ip: req.ip }, "Token inválido");
        res.status(401).json({ msg: "No autorizado, token inválido" });
    }
};

// Middleware para verificar si el usuario es administrador
export const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ msg: "Acceso denegado, se requieren permisos de administrador" });
    }
};

// Middleware genérico de autorización por rol.
//   router.get('/x', authMiddleware, requireRole('admin', 'vendedor'), handler)
export const requireRole = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ msg: "Acceso denegado, permisos insuficientes" });
};
