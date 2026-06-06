import React, { useEffect, useState } from "react";
import { getPropiedades, eliminarPropiedad } from "../services/propiedadService";
import { useToast } from "../context/ToastContext";
import "./Propiedades.css";

const Propiedades = ({ setActiveSection, setPropiedadSeleccionada, setModoEdicion }) => {
    const toast = useToast();
    const [propiedades, setPropiedades] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const propiedadesPorPagina = 3;

    const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        metrosMin: "",
        metrosMax: "",
        habitaciones: "",
        parqueaderos: "",
        tipo: ""
    });

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    };

    const aplicarFiltros = async () => {
        try {
            const res = await getPropiedades(filtros);
            setPropiedades(res.data);
            setPaginaActual(1);
        } catch (err) {
            console.error("Error al aplicar filtros", err);
        }
    };

    useEffect(() => {
        const fetchPropiedades = async () => {
            try {
                const res = await getPropiedades();
                setPropiedades(res.data);
            } catch (err) {
                console.error("Error al obtener propiedades:", err);
            }
        };
        fetchPropiedades();
    }, []);

    const indiceInicio = (paginaActual - 1) * propiedadesPorPagina;
    const indiceFin = indiceInicio + propiedadesPorPagina;
    const propiedadesPaginadas = propiedades.slice(indiceInicio, indiceFin);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (indiceFin < propiedades.length) setPaginaActual(paginaActual + 1);
    };

    const handleEliminarPropiedad = async (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta propiedad?");
        if (!confirmar) return;

        try {
            await eliminarPropiedad(id);
            toast.success("Propiedad eliminada correctamente");
            const res = await getPropiedades();
            setPropiedades(res.data);
        } catch (err) {
            console.error("Error al eliminar propiedad:", err);
            toast.error("No puedes eliminar esta propiedad, fue creada por otro usuario o no tienes permisos.");
        }
    };

    return (
        <div className="propiedades-container">
            <div className="header-container">
                <h2>Listado de Propiedades</h2>
                <button onClick={() => setModoEdicion(false) || setActiveSection("crear-propiedad")}>
                    ➕ Añadir Nueva Propiedad
                </button>
            </div>

            <div className="boton-filtro-container">
                <button className="filtros-toggle" onClick={() => setMostrarModalFiltros(true)}>
                    🔍 Filtros
                </button>
            </div>

            {mostrarModalFiltros && (
                <div className="modal-filtros-overlay">
                    <div className="modal-filtros">
                        <h3>Filtrar Propiedades</h3>
                        <div className="filtros-grid">
                            <input type="number" name="metrosMin" placeholder="Min m²" value={filtros.metrosMin} onChange={handleFiltroChange} />
                            <input type="number" name="metrosMax" placeholder="Max m²" value={filtros.metrosMax} onChange={handleFiltroChange} />
                            <input type="number" name="habitaciones" placeholder="Habitaciones" value={filtros.habitaciones} onChange={handleFiltroChange} />
                            <input type="number" name="parqueaderos" placeholder="Parqueaderos" value={filtros.parqueaderos} onChange={handleFiltroChange} />
                            <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange}>
                                <option value="">Todos los tipos</option>
                                <option value="casa">Casa</option>
                                <option value="departamento">Departamento</option>
                                <option value="terreno">Terreno</option>
                            </select>
                        </div>
                        <div className="modal-filtros-botones">
                            <button onClick={() => { aplicarFiltros(); setMostrarModalFiltros(false); }}>Aplicar</button>
                            <button className="limpiar" onClick={() => setFiltros({ metrosMin: "", metrosMax: "", habitaciones: "", parqueaderos: "", tipo: "" })}>
                                Limpiar Filtros
                            </button>
                            <button className="cerrar" onClick={() => setMostrarModalFiltros(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="prop-list">
                {propiedadesPaginadas.map((p) => (
                    <div className="propiedad-card" key={p._id}>
                        <div className="prop-card-content">
                            {p.imagenes && p.imagenes.length > 0 && (
                                <img
                                    src={p.imagenes[0]}
                                    alt={`Fachada de ${p.titulo}`}
                                    className="propiedad-img-lateral"
                                    onClick={() => {
                                        setPropiedadSeleccionada(p._id);
                                        setActiveSection("ver-propiedad");
                                    }}
                                    style={{ cursor: "pointer" }}
                                />
                            )}
                            <div className="prop-info">
                                <h3>{p.titulo}</h3>
                                <p>{p.ubicacion}</p>
                                <p>Precio: ${p.precio}</p>
                                <p>Estado: {p.estado}</p>
                                <button onClick={() => {
                                    setPropiedadSeleccionada(p._id);
                                    setActiveSection("ver-propiedad");
                                }}>
                                    👁 Ver más
                                </button>




                                <button className="delete-button" onClick={() => handleEliminarPropiedad(p._id)}>🗑 Eliminar</button>
                                <button onClick={() => {
                                    setPropiedadSeleccionada(p);
                                    setModoEdicion(true);
                                    setActiveSection("crear-propiedad");
                                }}>
                                    ✏️ Editar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {propiedades.length > propiedadesPorPagina && (
                <div className="paginacion">
                    <button onClick={paginaAnterior} disabled={paginaActual === 1}>◀ Anterior</button>
                    <span>Página {paginaActual}</span>
                    <button onClick={paginaSiguiente} disabled={indiceFin >= propiedades.length}>Siguiente ▶</button>
                </div>
            )}
        </div>
    );
};

export default Propiedades;
