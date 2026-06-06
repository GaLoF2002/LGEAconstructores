import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";

/**
 * AuthLayout — maqueta split inmersiva para pantallas de autenticación.
 * Presentacional puro: el formulario y su lógica se pasan como children.
 *
 * @param {string} image     URL de imagen para el panel lateral (opcional → panel grafito).
 * @param {string} eyebrow   Kicker sobre el título.
 * @param {string} title     Título (serif display).
 * @param {string} subtitle  Texto introductorio (opcional).
 * @param {string} aside     Frase del panel lateral (opcional).
 */
const AuthLayout = ({ image, eyebrow, title, subtitle, aside, children }) => (
    <div className="auth">
        <aside
            className={`auth__aside ${image ? "auth__aside--image" : ""}`}
            style={image ? { backgroundImage: `url(${image})` } : undefined}
        >
            <div className="auth__aside-inner">
                <Link to="/" className="auth__brand">
                    <span className="lgea-brand__mark">L</span>
                    <span className="auth__brand-name">
                        LGEA<small>Constructores</small>
                    </span>
                </Link>
                <p className="auth__aside-tagline">
                    {aside || "Construimos espacios que perduran. Bienvenido a la firma."}
                </p>
            </div>
        </aside>

        <main className="auth__main">
            <div className="auth__panel">
                <header className="auth__header">
                    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                    <h1 className="auth__title">{title}</h1>
                    {subtitle && <p className="auth__subtitle lede">{subtitle}</p>}
                </header>

                {children}

                <Link to="/" className="auth__back">← Volver al inicio</Link>
            </div>
        </main>
    </div>
);

export default AuthLayout;
