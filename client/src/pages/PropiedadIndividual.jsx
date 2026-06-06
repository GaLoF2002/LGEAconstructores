import { useContext, useEffect,useRef, useState } from "react";
import { getPropiedadPorId } from "../services/propiedadService";
import { AuthContext } from "../context/AuthContext";
import FormularioEvaluacion from "./FormularioEvaluacion";
import { registrarVisita, registrarDuracionVisualizacion} from "../services/visitaService";
import { marcarInteres, getMisIntereses, desmarcarInteres} from "../services/interesService";
import { useToast } from "../context/ToastContext";
import { PropertyGallery } from "../components/ui";
import {
    TbBed, TbBath, TbCar, TbRuler2, TbMapPin,
    TbCalendarPlus, TbKey, TbCalculator, TbHeart, TbHeartFilled, TbArrowLeft
} from "react-icons/tb";

import "./PropiedadIndividual.css";

const formatPrecio = (v) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);

const PropiedadIndividual = ({ propiedadId, setActiveSection,volverA }) => {
    const { user } = useContext(AuthContext);
    const toast = useToast();
    const [propiedad, setPropiedad] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mensajeFinal, setMensajeFinal] = useState(false);
    const visitaRegistrada = useRef(false);
    const tiempoInicio = useRef(null);
    const [yaInteresado, setYaInteresado] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL; // ej: https://tu-app.herokuapp.com


    useEffect(() => {
        if (!propiedadId) return;
        let cancelado = false;

        const cargar = async () => {
            // 1) La propiedad se carga para CUALQUIER rol (admin/vendedor/cliente).
            try {
                const res = await getPropiedadPorId(propiedadId);
                if (!cancelado) setPropiedad(res.data);
            } catch (err) {
                console.error("Error al cargar propiedad", err);
                return;
            }

            // 2) Intereses y registro de visita solo aplican al cliente.
            if (!user || user.role !== "cliente") return;
            if (visitaRegistrada.current) return; // evita registrar dos veces
            visitaRegistrada.current = true;

            try {
                const interesesRes = await getMisIntereses();
                const yaMarcado = interesesRes.data.some(
                    i => String(i.propiedad?._id) === String(propiedadId)
                );
                if (!cancelado) setYaInteresado(yaMarcado);
            } catch (err) {
                console.error("Error al cargar intereses", err);
            }

            try {
                await registrarVisita(propiedadId);
                tiempoInicio.current = Date.now();
            } catch (err) {
                console.error("Error al registrar visita", err);
            }
        };

        cargar();
        return () => { cancelado = true; };
    }, [propiedadId, user]);
    useEffect(() => {
        return () => {
            if (tiempoInicio.current && propiedadId && user?.role === "cliente") {
                const duracion = Math.floor((Date.now() - tiempoInicio.current) / 1000);
                registrarDuracionVisualizacion(propiedadId, duracion).catch(err =>
                    console.error("❌ Error al registrar duración:", err)
                );
            }
        };
    }, []);


    const handleFormularioCompletado = () => {
        setMensajeFinal(true);
        setTimeout(() => {
            setMostrarFormulario(false);
            setMensajeFinal(false);
        }, 3000);
    };

    if (!propiedad) return <p className="loading">Cargando propiedad...</p>;

    return (
        <div className="detalle-prop-container">
            {!mostrarFormulario ? (
                <>
                    <header className="detalle-prop-header">
                        <span className={`detalle-prop-estado estado--${propiedad.estado}`}>{propiedad.estado}</span>
                        <h2 className="titulo-propiedad">{propiedad.titulo}</h2>
                        {propiedad.ubicacion && (
                            <p className="detalle-prop-ubicacion">
                                <TbMapPin aria-hidden="true" /> {propiedad.ubicacion}
                            </p>
                        )}
                    </header>

                    <PropertyGallery
                        imagenes={propiedad.imagenes}
                        titulo={propiedad.titulo}
                        apiUrl={API_URL}
                    />

                    <div className="detalle-prop-grid">
                        <div className="detalle-prop-main">
                            <ul className="spec-tiles">
                                <li><TbBed aria-hidden="true" /><span className="spec-tiles__val">{propiedad.habitaciones}</span><span className="spec-tiles__lbl">Habitaciones</span></li>
                                <li><TbBath aria-hidden="true" /><span className="spec-tiles__val">{propiedad.banos}</span><span className="spec-tiles__lbl">Baños</span></li>
                                <li><TbCar aria-hidden="true" /><span className="spec-tiles__val">{propiedad.parqueaderos}</span><span className="spec-tiles__lbl">Parqueaderos</span></li>
                                <li><TbRuler2 aria-hidden="true" /><span className="spec-tiles__val">{propiedad.metrosCuadrados}</span><span className="spec-tiles__lbl">m² construidos</span></li>
                            </ul>

                            <section className="detalle-bloque">
                                <h3 className="detalle-bloque__titulo">Descripción</h3>
                                <p className="detalle-bloque__texto">{propiedad.descripcion || "Sin descripción disponible."}</p>
                            </section>

                            {propiedad.caracteristicas?.length > 0 && (
                                <section className="detalle-bloque">
                                    <h3 className="detalle-bloque__titulo">Características</h3>
                                    <ul className="detalle-chips">
                                        {propiedad.caracteristicas.filter(Boolean).map((c, i) => (
                                            <li key={i} className="detalle-chip">{c}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <section className="detalle-bloque">
                                <h3 className="detalle-bloque__titulo">Detalles</h3>
                                <dl className="detalle-datos">
                                    <div><dt>Tipo</dt><dd>{propiedad.tipo}</dd></div>
                                    <div><dt>Estado</dt><dd>{propiedad.estado}</dd></div>
                                    <div><dt>Ubicación</dt><dd>{propiedad.ubicacion}</dd></div>
                                    <div><dt>Superficie</dt><dd>{propiedad.metrosCuadrados} m²</dd></div>
                                </dl>
                            </section>
                        </div>

                        <aside className="detalle-prop-aside">
                            <div className="detalle-precio-card">
                                <span className="detalle-precio-card__label">Precio de venta</span>
                                <span className="detalle-precio-card__valor">{formatPrecio(propiedad.precio)}</span>

                                {user.role === "cliente" && (
                                    <div className="acciones-propiedad">
                                        <button
                                            className="accion-btn accion-btn--primary"
                                            onClick={() => setActiveSection("agendar-cita")}
                                        >
                                            <TbCalendarPlus aria-hidden="true" /> Agendar visita
                                        </button>
                                        <button
                                            className="accion-btn accion-btn--accent"
                                            onClick={() => setMostrarFormulario(true)}
                                        >
                                            <TbKey aria-hidden="true" /> Deseo comprar
                                        </button>
                                        <button
                                            className="accion-btn accion-btn--ghost"
                                            onClick={() => setActiveSection("simulador")}
                                        >
                                            <TbCalculator aria-hidden="true" /> Simular compra
                                        </button>
                                        <button
                                            className={`accion-btn accion-btn--ghost ${yaInteresado ? "is-active" : ""}`}
                                            onClick={async () => {
                                                try {
                                                    if (yaInteresado) {
                                                        await desmarcarInteres(propiedad._id);
                                                        toast.info("Interés eliminado");
                                                        setYaInteresado(false);
                                                    } else {
                                                        await marcarInteres(propiedad._id);
                                                        toast.success("Interés registrado correctamente");
                                                        setYaInteresado(true);
                                                    }
                                                } catch (err) {
                                                    toast.error(err.response?.data?.mensaje || "Error al modificar interés");
                                                }
                                            }}
                                        >
                                            {yaInteresado
                                                ? <><TbHeartFilled aria-hidden="true" /> Quitar interés</>
                                                : <><TbHeart aria-hidden="true" /> Me interesa</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </>
            ) : mensajeFinal ? (
                <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem", marginTop: "2rem" }}>
                    ✅ Gracias por tu interés. ¡Nos pondremos en contacto contigo muy pronto!
                </p>
            ) : (
                <div className="evaluacion-wrap">
                    <button className="btn-volver" onClick={() => setMostrarFormulario(false)}>
                        <TbArrowLeft aria-hidden="true" /> Volver a la propiedad
                    </button>
                    <FormularioEvaluacion
                        propiedadId={propiedad._id}
                        onFinalizar={handleFormularioCompletado}
                    />
                </div>
            )}
        </div>
    );
};

export default PropiedadIndividual;
