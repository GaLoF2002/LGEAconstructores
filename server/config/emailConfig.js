import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config(); // ✅ Asegura que se carguen las variables en este archivo

// El email es opcional: solo se activa si hay credenciales de Gmail.
const emailEnabled = Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

const transporter = emailEnabled
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    })
    : null;

if (!emailEnabled) {
    console.warn("⚠️  Email deshabilitado: faltan GMAIL_USER/GMAIL_PASS.");
}

export const sendEmail = async (to, subject, html) => {
    // Si no hay credenciales, no rompemos el flujo: solo registramos y seguimos.
    if (!transporter) {
        console.warn(`✉️  Correo NO enviado (Gmail no configurado): "${subject}" → ${to}`);
        return;
    }
    await transporter.sendMail({
        from: `"LGEA Constructores" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
    });
};

export default transporter;
