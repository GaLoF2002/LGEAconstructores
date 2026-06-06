import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/");
    };

    const goToPanel = () => {
        setOpen(false);
        if (!user) return navigate("/login");
        navigate(`/${user.role}`);
    };

    return (
        <header className="lgea-header">
            <div className="lgea-header__inner">
                <Link to="/" className="lgea-brand" onClick={() => setOpen(false)}>
                    <span className="lgea-brand__mark">L</span>
                    <span className="lgea-brand__name">LGEA<span className="lgea-brand__sub">Constructores</span></span>
                </Link>

                <button
                    className="lgea-burger"
                    aria-label="Abrir menú"
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                >
                    <span></span><span></span><span></span>
                </button>

                <nav className={`lgea-nav ${open ? "is-open" : ""}`}>
                    {user?.role === "cliente" ? (
                        <Link to="/cliente" onClick={() => setOpen(false)}>Propiedades</Link>
                    ) : (
                        <Link to={user ? "/propiedades" : "/"} onClick={() => setOpen(false)}>Propiedades</Link>
                    )}
                    <Link to="/about" onClick={() => setOpen(false)}>Nosotros</Link>
                    <Link to="/contact" onClick={() => setOpen(false)}>Contacto</Link>

                    {user ? (
                        <>
                            <button className="btn btn-secondary" onClick={goToPanel}>Mi panel</button>
                            <button className="btn" onClick={handleLogout}>Salir</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setOpen(false)}>
                                <button className="btn btn-secondary">Iniciar sesión</button>
                            </Link>
                            <Link to="/register" onClick={() => setOpen(false)}>
                                <button className="btn btn-accent">Registrarse</button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
