import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getSellers, createSeller, updateSeller, deleteSeller } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import {
    FiHome, FiUsers, FiGrid, FiBarChart2, FiCalendar,
    FiClipboard, FiLogOut, FiEdit2, FiTrash2, FiMenu
} from "react-icons/fi";
import Propiedades from "../pages/Propiedades.jsx";
import CrearPropiedad from "../pages/CrearPropiedad";
import ResumenMensualAdmin from "../pages/ResumenMensualAdmin.jsx";
import AgendamientoVendedor from "../pages/AgendamientoVendedor.jsx";
import GestionarCitasVendedor from "../pages/GestionarCitasVendedor.jsx";
import VistaPublicaPropiedad from "../pages/VistaPublicaPropiedad";
import CitasPendientesVendedor from "../pages/CitasPendientesVendedor.jsx";
import AdminCompradoresPage from "../pages/AdminCompradoresPage.jsx";
import EvaluacionDetalleCliente from "../pages/EvaluacionDetalleCliente.jsx";

import "./AdminDashboard.css";

// Secciones del menú (fuente única para sidebar y accesos directos)
const NAV_ITEMS = [
    { id: "home", label: "Inicio", Icon: FiHome },
    { id: "sellers", label: "Vendedores", Icon: FiUsers },
    { id: "propiedades", label: "Propiedades", Icon: FiGrid },
    { id: "ver-compradores", label: "Ver Compradores", Icon: FiUsers },
    { id: "resumen-citas", label: "Resumen Citas", Icon: FiBarChart2 },
    { id: "agendamiento", label: "Agendamiento", Icon: FiCalendar },
    { id: "citas-pendientes", label: "Citas Pendientes", Icon: FiClipboard },
];

// Sección de Inicio del Dashboard
const HomeSection = ({ onNavigate }) => (
    <div className="home-section">
        <span className="dash-eyebrow">Panel de administración</span>
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

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("home");
    const [sellers, setSellers] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [newSeller, setNewSeller] = useState({
        name: "", email: "", phone: "", password: "",
        codigoVendedor: "", inmobiliaria: "", genero: ""
    });
    const [editSeller, setEditSeller] = useState(null);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
    const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        if (activeSection === "sellers") {
            fetchSellers();
        }
    }, [activeSection, search, sortOrder]);

    const fetchSellers = async () => {
        try {
            const response = await getSellers(search, sortOrder);
            setSellers(response.data || []);
        } catch (error) {
            console.error("Error al obtener vendedores:", error);
            toast.error("Error al obtener la lista de vendedores.");
        }
    };

    const handleInputChange = (e, isEditMode) => {
        const { id, value } = e.target;
        const fieldName = e.target.name || id;

        if (isEditMode) {
            setEditSeller(prev => ({ ...prev, [fieldName]: value }));
        } else {
            setNewSeller(prev => ({ ...prev, [fieldName]: value }));
        }
    };

    const resetNewSellerForm = () => {
        setNewSeller({ name: "", email: "", phone: "", password: "", codigoVendedor: "", inmobiliaria: "", genero: "" });
    };

    const handleCreateSeller = async (e) => {
        e.preventDefault();
        try {
            await createSeller(newSeller);
            toast.success("Vendedor creado correctamente");
            fetchSellers();
            resetNewSellerForm();
        } catch (error) {
            console.error("Error al crear vendedor:", error);
            toast.error("No se pudo crear el vendedor. Verifica los datos e intenta de nuevo.");
        }
    };

    const handleEditSellerClick = (seller) => {
        setEditSeller({ ...seller });
    };

    const handleUpdateSeller = async (e) => {
        e.preventDefault();
        if (!editSeller || !editSeller._id) return;
        try {
            // eslint-disable-next-line no-unused-vars
            const { password, ...dataToUpdate } = editSeller;
            await updateSeller(editSeller._id, dataToUpdate);
            toast.success("Vendedor actualizado correctamente");
            setEditSeller(null);
            fetchSellers();
        } catch (error) {
            console.error("Error al actualizar vendedor:", error);
            toast.error("No se pudo actualizar el vendedor. Intenta de nuevo.");
        }
    };

    const handleDeleteSeller = async (id) => {
        if (window.confirm("¿Está seguro de que desea eliminar este vendedor?")) {
            try {
                await deleteSeller(id);
                toast.success("Vendedor eliminado correctamente");
                fetchSellers();
            } catch (error) {
                console.error("Error al eliminar vendedor:", error);
                toast.error("No se pudo eliminar el vendedor. Intenta de nuevo.");
            }
        }
    };

    const formData = editSeller || newSeller;

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-container">
            <button
                className="hamburger-menu"
                aria-label="Abrir menú"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <FiMenu />
            </button>

            <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar__brand">
                    <span className="sidebar__mark">L</span>
                    <span className="sidebar__brand-name">LGEA<small>Admin</small></span>
                </div>
                <ul>
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
                        <button onClick={handleLogout}><FiLogOut aria-hidden="true" /> Cerrar sesión</button>
                    </li>
                </ul>
            </nav>

            <div className="main-content">
                {activeSection === "home" && (
                    <HomeSection onNavigate={handleSectionChange} />
                )}

                {activeSection === "sellers" && (
                    <div className="sellers-section">
                        <header className="dash-section-head">
                            <span className="dash-eyebrow">Equipo</span>
                            <h1>Gestión de vendedores</h1>
                        </header>

                        <div className="sellers-container">
                            <div className="sellers-list-container">
                                <div className="sellers-list">
                                    <h2>Lista de vendedores</h2>
                                    <div className="filters">
                                        <input type="text" placeholder="Buscar vendedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                            <option value="asc">A-Z</option>
                                            <option value="desc">Z-A</option>
                                        </select>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="sellers-table">
                                            <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Teléfono</th>
                                                <th className="hide-on-mobile">Código</th>
                                                <th className="hide-on-mobile">Inmobiliaria</th>
                                                <th className="hide-on-mobile">Género</th>
                                                <th>Acciones</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {sellers.length > 0 ? sellers.map((seller) => (
                                                <tr key={seller._id}>
                                                    <td data-label="Nombre">{seller.name}</td>
                                                    <td data-label="Email">{seller.email}</td>
                                                    <td data-label="Teléfono">{seller.phone}</td>
                                                    <td data-label="Código" className="hide-on-mobile">{seller.codigoVendedor || "-"}</td>
                                                    <td data-label="Inmobiliaria" className="hide-on-mobile">{seller.inmobiliaria || "-"}</td>
                                                    <td data-label="Género" className="hide-on-mobile">{seller.genero || "-"}</td>
                                                    <td data-label="Acciones" className="actions-cell">
                                                        <button className="action-button edit-button" aria-label="Editar" onClick={() => handleEditSellerClick(seller)}><FiEdit2 /></button>
                                                        <button className="action-button delete-button" aria-label="Eliminar" onClick={() => handleDeleteSeller(seller._id)}><FiTrash2 /></button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="7" className="sellers-table__empty">
                                                        No se encontraron vendedores o la lista está vacía.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="register-form-container">
                                <h2>{editSeller ? "Editar vendedor" : "Crear nuevo vendedor"}</h2>
                                <form className="register-form" onSubmit={editSeller ? handleUpdateSeller : handleCreateSeller}>
                                    <div className="register-form__grid">
                                        <div className="rf-field">
                                            <label htmlFor="name">Nombre completo</label>
                                            <input id="name" type="text" value={formData.name || ""} onChange={(e) => handleInputChange(e, !!editSeller)} required />
                                        </div>

                                        <div className="rf-field">
                                            <label htmlFor="email">Email</label>
                                            <input id="email" type="email" value={formData.email || ""} onChange={(e) => handleInputChange(e, !!editSeller)} required />
                                        </div>

                                        {!editSeller && (
                                            <div className="rf-field">
                                                <label htmlFor="password">Contraseña</label>
                                                <input id="password" type="password" value={newSeller.password || ""} onChange={(e) => handleInputChange(e, false)} required />
                                            </div>
                                        )}

                                        <div className="rf-field">
                                            <label htmlFor="phone">Teléfono</label>
                                            <input id="phone" type="tel" value={formData.phone || ""} onChange={(e) => handleInputChange(e, !!editSeller)} required />
                                        </div>

                                        <div className="rf-field">
                                            <label htmlFor="codigoVendedor">Código vendedor</label>
                                            <input id="codigoVendedor" type="text" value={formData.codigoVendedor || ""} onChange={(e) => handleInputChange(e, !!editSeller)} />
                                        </div>

                                        <div className="rf-field">
                                            <label htmlFor="inmobiliaria">Inmobiliaria</label>
                                            <input id="inmobiliaria" type="text" value={formData.inmobiliaria || ""} onChange={(e) => handleInputChange(e, !!editSeller)} />
                                        </div>

                                        <div className="rf-field">
                                            <label htmlFor="genero">Género</label>
                                            <select id="genero" value={formData.genero || ""} onChange={(e) => handleInputChange(e, !!editSeller)}>
                                                <option value="">Seleccionar género...</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="femenino">Femenino</option>
                                                <option value="otro">Otro</option>
                                                <option value="prefiero no decir">Prefiero no decir</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="register-form__actions">
                                        <button className="Submmitbutton" type="submit">{editSeller ? "Actualizar vendedor" : "Crear vendedor"}</button>
                                        {editSeller && <button type="button" className="Cancelbutton" onClick={() => setEditSeller(null)}>Cancelar edición</button>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "ver-propiedad" && propiedadSeleccionada && (
                    <VistaPublicaPropiedad
                        propiedadId={propiedadSeleccionada}
                        setActiveSection={handleSectionChange}
                        volverA="propiedades"
                    />
                )}

                {activeSection === "propiedades" && (
                    <Propiedades setActiveSection={handleSectionChange} setPropiedadSeleccionada={setPropiedadSeleccionada} setModoEdicion={setModoEdicion} />
                )}
                {activeSection === "crear-propiedad" && (
                    <CrearPropiedad setActiveSection={handleSectionChange} modoEdicion={modoEdicion} propiedadEditando={propiedadSeleccionada} />
                )}
                {activeSection === "resumen-citas" && (
                    <ResumenMensualAdmin />
                )}
                {activeSection === "agendamiento" && (
                    <div className="admin-agendamiento-section">
                        <AgendamientoVendedor />
                    </div>
                )}
                {activeSection === "mis-citas" && (
                    <div className="admin-citas-section">
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
                {activeSection === "detalle-evaluacion" && evaluacionSeleccionadaId && (
                    <EvaluacionDetalleCliente evaluacionId={evaluacionSeleccionadaId} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
