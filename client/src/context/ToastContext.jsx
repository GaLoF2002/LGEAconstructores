import { createContext, useCallback, useContext, useRef, useState } from "react";
import ToastContainer from "../components/ui/Toast";

const ToastContext = createContext(null);

/**
 * Proveedor global de notificaciones tipo "toast".
 * Reemplaza los alert() nativos por avisos propios (verde éxito / rojo error).
 *
 * Uso:
 *   const toast = useToast();
 *   toast.success("Propiedad creada correctamente");
 *   toast.error("No se pudo guardar la propiedad");
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((message, type = "info", duration = 4000) => {
        if (!message) return;
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => remove(id), duration);
        }
        return id;
    }, [remove]);

    const api = {
        push,
        success: (msg, duration) => push(msg, "success", duration),
        error: (msg, duration) => push(msg, "error", duration),
        info: (msg, duration) => push(msg, "info", duration),
        remove,
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastContainer toasts={toasts} onClose={remove} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>");
    }
    return ctx;
};
