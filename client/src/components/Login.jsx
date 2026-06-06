import { useState, useContext } from "react";
import { login } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AuthLayout, Button } from "./ui";
import usePageMeta from "../hooks/usePageMeta";
import "./Notificacion.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login: loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    usePageMeta({ title: "Iniciar sesión", path: "/login" });
    const location = useLocation();
    const mensajeExito = location.state?.mensaje;
    const [notification, setNotification] = useState(null);

    const showNotification = (message, isError = true) => {
        setNotification({ message, isError, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await login({ email, password });
            const propiedadPendiente = localStorage.getItem("propiedadPendiente");

            // El JWT ya viaja en una cookie httpOnly; en localStorage solo queda el perfil (no sensible).
            localStorage.setItem("user", JSON.stringify(response.data.user));
            loginUser(response.data.user);

            if (propiedadPendiente) {
                localStorage.removeItem("propiedadPendiente");
                localStorage.setItem("propiedadSeleccionada", propiedadPendiente);
                navigate("/cliente");
            } else {
                navigate(`/${response.data.user.role}`);
            }
        } catch (error) {
            showNotification("Email o contraseña incorrectos. Inténtalo de nuevo.");
        }
    };

    return (
        <AuthLayout
            eyebrow="Acceso"
            title="Bienvenido de vuelta."
            subtitle="Ingresa para gestionar tus propiedades, citas y evaluaciones."
            aside="El detalle es la diferencia entre una casa y un hogar."
        >
            {mensajeExito && (
                <div className="notification success">{mensajeExito}</div>
            )}
            <form className="auth__form" onSubmit={handleLogin}>
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
                <label className="field">
                    <span>Contraseña</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <Button type="submit" variant="accent" size="lg">Ingresar</Button>
            </form>

            <div className="auth__meta">
                <span className="auth__link" onClick={() => navigate("/forgot-password")}>
                    ¿Olvidaste tu contraseña?
                </span>
                <span>¿No tienes cuenta? <a href="/register">Regístrate</a></span>
            </div>

            {notification?.visible && (
                <div className={`notification ${notification.isError ? "error" : "success"}`}>
                    {notification.message}
                </div>
            )}
        </AuthLayout>
    );
};

export default Login;
