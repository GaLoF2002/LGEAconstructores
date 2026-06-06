import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Envuelve una ruta privada. Si no hay sesión, redirige a /login.
 * Si se pasa `roles`, exige que el user.role esté en la lista.
 *
 * Uso:
 *   <Route path="/admin" element={
 *     <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children, roles }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
