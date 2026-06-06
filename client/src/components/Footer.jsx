import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Footer.css";

const Footer = () => {
    const year = new Date().getFullYear();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <footer className="lgea-footer">
            <div className="lgea-footer__inner">
                <div className="lgea-footer__brand">
                    <div className="lgea-footer__logo">
                        <span className="lgea-brand__mark">L</span>
                        <span>LGEA<small>Constructores</small></span>
                    </div>
                    <p className="lgea-footer__tagline">
                        Construyendo proyectos residenciales de excelencia en Cumbayá y Tumbaco.
                    </p>
                </div>

                <div className="lgea-footer__cols">
                    <div>
                        <h4>Navegación</h4>
                        <ul>
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/about">Nosotros</Link></li>
                            <li><Link to="/contact">Contacto</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Cuenta</h4>
                        <ul>
                            {user ? (
                                <>
                                    <li><Link to={`/${user.role}`}>Mi panel</Link></li>
                                    <li><button className="footer-link-btn" onClick={handleLogout}>Cerrar sesión</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login">Iniciar sesión</Link></li>
                                    <li><Link to="/register">Registrarse</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4>Contacto</h4>
                        <ul>
                            <li>Cumbayá, Quito, Ecuador</li>
                            <li>099 862 8563</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="lgea-footer__bottom">
                <span>&copy; {year} LGEA Constructores. Todos los derechos reservados.</span>
            </div>
        </footer>
    );
};

export default Footer;
