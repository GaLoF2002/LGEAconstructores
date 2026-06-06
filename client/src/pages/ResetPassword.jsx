import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetearContrasena } from "../services/authService";
import imagenEdificio from '../assets/edificio-resetPass.jpg';
import { AuthLayout, Button } from "../components/ui";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await resetearContrasena(token, password);
            setMessage(res.data.msg || "Contraseña actualizada correctamente");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setMessage("Error al restablecer la contraseña");
        }
    };

    return (
        <AuthLayout
            image={imagenEdificio}
            eyebrow="Nueva contraseña"
            title="Restablece tu acceso."
            subtitle="Elige una contraseña nueva y segura para tu cuenta."
            aside="Tu seguridad es parte de nuestro trabajo."
        >
            <form className="auth__form" onSubmit={handleSubmit}>
                <label className="field">
                    <span>Nueva contraseña</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <Button type="submit" variant="accent" size="lg">Guardar</Button>
            </form>

            {message && <p className="auth__message">{message}</p>}
        </AuthLayout>
    );
};

export default ResetPassword;
