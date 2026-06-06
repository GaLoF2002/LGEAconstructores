import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config(); // ✅ Asegura que se carguen las variables en este archivo


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

export const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"LGEA Constructores" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
    });
};
