import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {sendEmail} from '../config/emailConfig.js';

// Hash dummy para igualar el tiempo de respuesta cuando el usuario no existe
// (mitiga enumeración de usuarios por timing en el login).
const DUMMY_HASH = bcrypt.hashSync("dummy-password-placeholder", 10);

// Opciones de la cookie httpOnly que transporta el JWT.
// httpOnly: JS no puede leerla (mitiga robo por XSS).
// secure: solo HTTPS en producción. sameSite: 'lax' protege contra CSRF en POST/PUT/DELETE.
const COOKIE_NAME = "token";
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 día (igual que el TTL del JWT)
});


export const register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "No se pudo completar el registro" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ name, email, password: hashedPassword, phone, role: "cliente" });
        await user.save();

        res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error en el registro" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Comparación dummy: mismo costo de tiempo que un usuario real (anti-enumeración).
            await bcrypt.compare(password, DUMMY_HASH);
            // Evento de seguridad (sin contraseña) para monitoreo de fuerza bruta.
            req.log?.warn({ event: "login_failed", reason: "user_not_found", email, ip: req.ip }, "Login fallido");
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.log?.warn({ event: "login_failed", reason: "bad_password", email, ip: req.ip }, "Login fallido");
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        // Generar token JWT (incluye tokenVersion para poder invalidar sesiones).
        const token = jwt.sign(
            { id: user._id, role: user.role, tv: user.tokenVersion ?? 0 },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // El JWT viaja en una cookie httpOnly (no accesible por JS).
        res.cookie(COOKIE_NAME, token, cookieOptions());

        res.json({ user: { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Error en el inicio de sesión" });
    }
};

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (typeof email !== "string") {
        return res.status(200).json({ msg: "Si el email existe, se ha enviado un correo." });
    }

    try {
        const user = await User.findOne({ email });

        // Respuesta genérica siempre (evita enumeración).
        if (!user) {
            return res.status(200).json({ msg: "Si el email existe, se ha enviado un correo." });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(rawToken);

        // Update puntual: no usa save() para evitar disparar validadores no relacionados.
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetToken: tokenHash,
                    resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
                }
            }
        );

        const resetUrl = `${process.env.FRONTEND_URL.split(',')[0].trim()}/reset-password/${rawToken}`;
        const html = `
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace (válido 15 minutos):</p>
            <a href="${resetUrl}">Restablecer contraseña</a>
            <p>Si no fuiste tú, ignora este correo.</p>
        `;

        await sendEmail(user.email, "Recuperar contraseña", html);
        res.status(200).json({ msg: "Si el email existe, se ha enviado un correo." });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 8 caracteres." });
    }
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    try {
        const tokenHash = hashToken(token);
        const user = await User.findOne({
            resetToken: tokenHash,
            resetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ msg: "Token inválido o expirado" });
        }

        const newHash = await bcrypt.hash(password, 12);
        await User.updateOne(
            { _id: user._id },
            {
                $set: { password: newHash },
                $unset: { resetToken: "", resetTokenExpires: "" },
                $inc: { tokenVersion: 1 }  // invalida JWTs previos
            }
        );

        res.json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
};

// Logout: invalida todos los JWT previos del usuario.
export const logout = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user._id },
            { $inc: { tokenVersion: 1 } }
        );
        // Limpia la cookie httpOnly (mismas opciones que al fijarla).
        res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
        res.json({ msg: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ error: "Error al cerrar sesión" });
    }
};


