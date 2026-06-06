import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfilCliente, actualizarPerfil } from "../services/userService";
import "./PerfilCliente.css";

const Perfil = () => {
    const [perfil, setPerfil] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        currentPassword: ""
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await obtenerPerfilCliente();
                setPerfil({ ...res.data, password: "", currentPassword: "" });
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
                setMessage("Error al cargar el perfil.");
            }
        };
        fetchPerfil();
    }, []);

    const handleChange = (e) => {
        setPerfil({
            ...perfil,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await actualizarPerfil(perfil);
            setPerfil((p) => ({ ...p, password: "", currentPassword: "" }));
            if (res?.data?.passwordChanged) {
                setMessage("Contraseña actualizada. Vuelve a iniciar sesión.");
            } else {
                setMessage("Perfil actualizado correctamente");
            }
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            setMessage(error.response?.data?.error || "Error al actualizar el perfil");
        }
    };

    return (
        <div className="perfil-container">
            <div className="perfil-box">
                <h2>Mi Perfil</h2>

                <form className="perfil-form" onSubmit={handleSubmit}>
                    <label>Nombre</label>
                    <input
                        type="text"
                        name="name"
                        value={perfil.name}
                        onChange={handleChange}
                        required
                    />
                    <label>Correo</label>
                    <input
                        type="email"
                        name="email"
                        value={perfil.email}
                        onChange={handleChange}
                        required
                    />
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="phone"
                        value={perfil.phone}
                        onChange={handleChange}
                        required
                    />

                    <label>Nueva contraseña (opcional)</label>
                    <input
                        type="password"
                        name="password"
                        value={perfil.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Déjalo vacío si no la cambias"
                    />

                    <label>Contraseña actual</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={perfil.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        placeholder="Requerida para cambiar email o contraseña"
                    />

                    <button type="submit">Guardar Cambios</button>
                </form>

                {message && <p className={message.includes("Error") ? "perfil-error" : "perfil-message"}>{message}</p>}
            </div>
        </div>
    );
};

export default Perfil;
