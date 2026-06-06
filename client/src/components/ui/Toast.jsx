import "./Toast.css";

const ICONS = {
    success: "✓",
    error: "✕",
    info: "i",
};

/**
 * Pila de notificaciones renderizada por el ToastProvider.
 * No se usa directamente; se interactúa vía useToast().
 */
const ToastContainer = ({ toasts, onClose }) => {
    if (!toasts.length) return null;

    return (
        <div className="toast-stack" role="region" aria-live="polite" aria-label="Notificaciones">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast--${t.type}`} role="alert">
                    <span className="toast__icon" aria-hidden="true">{ICONS[t.type] || ICONS.info}</span>
                    <p className="toast__message">{t.message}</p>
                    <button
                        type="button"
                        className="toast__close"
                        onClick={() => onClose(t.id)}
                        aria-label="Cerrar notificación"
                    >
                        ✕
                    </button>
                    <span className="toast__bar" aria-hidden="true" />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
