import React, { useState } from "react";
import { enviarEmailRecuperacion } from "../services/authService";
import imagenEdificio from '../assets/edificio-forgotPass.jpg';
import { AuthLayout, Button } from "../components/ui";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await enviarEmailRecuperacion(email);
            setMessage(res.data.msg);
        } catch (error) {
            setMessage("Error al procesar la solicitud.");
        }
    };

    return (
        <AuthLayout
            image={imagenEdificio}
            eyebrow="Recuperación"
            title="Recupera tu contraseña."
            subtitle="Ingresa tu correo registrado y te enviaremos un enlace para restablecerla."
            aside="Estamos para ayudarte a volver."
        >
            <form className="auth__form" onSubmit={handleSubmit}>
                <label className="field">
                    <span>Correo electrónico</span>
                    <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <Button type="submit" variant="accent" size="lg">Enviar enlace</Button>
            </form>

            {message && <p className="auth__message">{message}</p>}

            <div className="auth__meta">
                <span>¿Recordaste tu contraseña? <a href="/login">Inicia sesión</a></span>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
