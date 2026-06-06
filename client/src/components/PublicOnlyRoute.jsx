import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Redirige al panel del usuario si ya tiene sesión activa.
// Uso: envuelve /login y /register para que un usuario logueado no pueda volver a esas páginas.
export default function PublicOnlyRoute({ children }) {
    const { user } = useContext(AuthContext);
    if (user) {
        return <Navigate to={`/${user.role}`} replace />;
    }
    return children;
}
