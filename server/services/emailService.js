import transporter from "../config/emailConfig.js";

// Función para enviar correos
export const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"Soporte" <${process.env.GMAIL_USER}>`, // Nombre del remitente
            to, // Destinatario
            subject, // Asunto del correo
            text, // Contenido del correo en texto plano
        });

        console.log("Correo enviado con éxito:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error enviando correo:", error);
        return false;
    }
};
