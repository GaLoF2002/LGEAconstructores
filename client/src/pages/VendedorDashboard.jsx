import React, { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    FiHome, FiGrid, FiCalendar, FiClipboard, FiUsers,
    FiTrendingUp, FiBarChart2, FiLogOut, FiMenu
} from "react-icons/fi";
import Propiedades from "../pages/Propiedades";
import CrearPropiedad from "../pages/CrearPropiedad";
import VistaPublicaPropiedad from "./VistaPublicaPropiedad.jsx";
import AgendamientoVendedor from "./AgendamientoVendedor.jsx";
import "./VendedorDashboard.css";
import GestionarCitasVendedor from "./GestionarCitasVendedor.jsx";
import CitasPendientesVendedor from "./CitasPendientesVendedor.jsx";
import AdminCompradoresPage from "./AdminCompradoresPage.jsx";
import IndicadoresPage from "../pages/IndicadoresPage";
import EstadisticasCitasVendedor from "./EstadisticasCitasVendedor.jsx";
import EvaluacionDetalleCliente from "./EvaluacionDetalleCliente.jsx";

const NAV_ITEMS = [
    { id: "home", label: "Inicio", Icon: FiHome },
    { id: "propiedades", label: "Propiedades", Icon: FiGrid },
    { id: "agendamiento", label: "Agendamiento", Icon: FiCalendar },
    { id: "citas-pendientes", label: "Citas Pendientes", Icon: FiClipboard },
    { id: "ver-compradores", label: "Ver Compradores", Icon: FiUsers },
    { id: "reportes", label: "Ver Reportes", Icon: FiTrendingUp },
    { id: "citas-resumen", label: "Citas Ejecutadas", Icon: FiBarChart2 },
];

const HomeSection = ({ onNavigate }) => (
    <div className="home-section">
        <span className="dash-eyebrow">Panel del vendedor</span>
        <h1 className="home-title">Bienvenido de vuelta.</h1>
        <p className="home-subtitle">Selecciona una opción para comenzar.</p>

        <div className="dashboard-shortcuts">
            {NAV_ITEMS.filter((item) => item.id !== "home").map(({ id, label, Icon }) => (
                <button key={id} className="shortcut-item" onClick={() => onNavigate(id)}>
                    <Icon className="shortcut-item__icon" aria-hidden="true" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    </div>
);

const VendedorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);
    const [activeSection, setActiveSection] = useState("home");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
    const [menuAbierto, setMenuAbierto] = useState(false);

    if (!user || user.role !== "vendedor") {
        return <Navigate to="/" />;
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setMenuAbierto(false);
    };

    return (
        <div className="vendedor-dashboard-container">
            <button className="vendedor-hamburger-menu" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú">
                <FiMenu />
            </button>

            <nav className={`vendedor-sidebar ${menuAbierto ? "abierto" : ""}`}>
                <div className="sidebar__brand">
                    <span className="sidebar__mark">L</span>
                    <span className="sidebar__brand-name">LGEA<small>Vendedor</small></span>
                </div>

                <ul className="vendedor-nav-links">
                    {NAV_ITEMS.map(({ id, label, Icon }) => (
                        <li key={id}>
                            <button
                                className={activeSection === id ? "is-active" : ""}
                                onClick={() => handleSectionChange(id)}
                            >
                                <Icon aria-hidden="true" /> {label}
                            </button>
                        </li>
                    ))}
                    <li className="sidebar__logout">
                        <button onClick={() => { handleLogout(); setMenuAbierto(false); }}>
                            <FiLogOut aria-hidden="true" /> Cerrar sesión
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="vendedor-main-content">
                {activeSection === "home" && <HomeSection onNavigate={handleSectionChange} />}

                {activeSection === "propiedades" && (
                    <div className="vendedor-propiedades-section">
                        <Propiedades
                            setActiveSection={handleSectionChange}
                            setPropiedadSeleccionada={setPropiedadSeleccionada}
                            setModoEdicion={setModoEdicion}
                        />
                    </div>
                )}
                {activeSection === "crear-propiedad" && (
                    <div className="vendedor-crear-propiedad-section">
                        <CrearPropiedad
                            setActiveSection={handleSectionChange}
                            modoEdicion={modoEdicion}
                            propiedadEditando={propiedadSeleccionada}
                        />
                    </div>
                )}
                {activeSection === "ver-propiedad" && propiedadSeleccionada && (
                    <div className="vendedor-ver-propiedad-section">
                        <VistaPublicaPropiedad
                            propiedadId={propiedadSeleccionada}
                            setActiveSection={handleSectionChange}
                            volverA="propiedades"
                        />
                    </div>
                )}

                {activeSection === "perfil" && (
                    <div className="vendedor-dashboard-content">
                        <h1>Perfil del vendedor</h1>
                    </div>
                )}

                {activeSection === "agendamiento" && (
                    <div className="vendedor-agendamiento-section">
                        <AgendamientoVendedor />
                    </div>
                )}
                {activeSection === "mis-citas" && (
                    <div className="vendedor-citas-section">
                        <GestionarCitasVendedor />
                    </div>
                )}
                {activeSection === "citas-pendientes" && (
                    <div className="vendedor-citas-pendientes-section">
                        <CitasPendientesVendedor />
                    </div>
                )}
                {activeSection === "ver-compradores" && (
                    <div className="vendedor-compradores-section">
                        <AdminCompradoresPage
                            setActiveSection={handleSectionChange}
                            setPropiedadSeleccionada={setPropiedadSeleccionada}
                            setEvaluacionSeleccionadaId={setEvaluacionSeleccionadaId}
                        />
                    </div>
                )}
                {activeSection === "reportes" && (
                    <div className="vendedor-reportes-section">
                        <IndicadoresPage />
                    </div>
                )}
                {activeSection === "citas-resumen" && (
                    <div className="vendedor-citas-resumen-section">
                        <EstadisticasCitasVendedor />
                    </div>
                )}
                {activeSection === "detalle-evaluacion" && evaluacionSeleccionadaId && (
                    <EvaluacionDetalleCliente evaluacionId={evaluacionSeleccionadaId} />
                )}
            </div>
        </div>
    );
};

export default VendedorDashboard;
