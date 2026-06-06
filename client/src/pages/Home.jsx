import React, { useEffect, useState, useContext } from "react";
import { getPropiedades } from "../services/propiedadService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Button, Container, Eyebrow, SectionHeader, PropertyCard, CountUp } from "../components/ui";
import usePageMeta from "../hooks/usePageMeta";
import imgUno from "../assets/edificio-register.jpg";
import imgDos from "../assets/edificio-forgotPass.jpg";
import imgTres from "../assets/edificio-resetPass.jpg";

const FILTROS_VACIOS = { metrosMin: "", metrosMax: "", habitaciones: "", parqueaderos: "", tipo: "" };

/* Datos de muestra (demo): se usan sólo cuando el backend no devuelve propiedades,
   para visualizar el diseño del listado sin depender de la API. */
const PROPIEDADES_DEMO = [
    { _id: "demo-1", titulo: "Casa Mirador del Valle", ubicacion: "Cumbayá, Quito", tipo: "casa",         habitaciones: 4, banos: 4, metrosCuadrados: 320, precio: 485000, imagenes: [imgUno] },
    { _id: "demo-2", titulo: "Residencia Tumbaco Hills", ubicacion: "Tumbaco, Quito", tipo: "casa",        habitaciones: 5, banos: 5, metrosCuadrados: 410, precio: 620000, imagenes: [imgDos] },
    { _id: "demo-3", titulo: "Penthouse Jardines del Este", ubicacion: "Cumbayá, Quito", tipo: "departamento", habitaciones: 3, banos: 3, metrosCuadrados: 210, precio: 395000, imagenes: [imgTres] },
    { _id: "demo-4", titulo: "Villa La Primavera", ubicacion: "Tumbaco, Quito", tipo: "casa",              habitaciones: 4, banos: 3, metrosCuadrados: 285, precio: 430000, imagenes: [imgDos] },
    { _id: "demo-5", titulo: "Suite Río Chiche", ubicacion: "Cumbayá, Quito", tipo: "departamento",        habitaciones: 2, banos: 2, metrosCuadrados: 130, precio: 245000, imagenes: [imgTres] },
    { _id: "demo-6", titulo: "Terreno Lomas de Cumbayá", ubicacion: "Cumbayá, Quito", tipo: "terreno",      habitaciones: 0, banos: 0, metrosCuadrados: 600, precio: 310000, imagenes: [imgUno] },
];

const Home = () => {
    const [propiedades, setPropiedades] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const propiedadesPorPagina = 6;
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    usePageMeta({
        title: "Casas y departamentos en Cumbayá y Tumbaco",
        description: "Explora propiedades residenciales premium de LGEA Constructores en Cumbayá y Tumbaco, Quito. Casas, departamentos y terrenos. Agenda una visita privada.",
        path: "/",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "LGEA Constructores",
            url: "https://www.lgeaconstructores.com/",
            inLanguage: "es-EC",
            publisher: { "@type": "RealEstateAgent", name: "LGEA Constructores" },
        },
    });

    const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);

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

    const handleVerMas = (id) => {
        if (!user) {
            localStorage.setItem("propiedadPendiente", id);
            navigate("/login");
        } else {
            localStorage.setItem("propiedadSeleccionada", id);
            navigate("/cliente");
        }
    };

    const scrollAListado = () => {
        document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" });
    };

    const formatPrecio = (v) =>
        new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);

    // Si el backend no devolvió propiedades, mostramos datos de muestra (demo).
    const lista = propiedades.length > 0 ? propiedades : PROPIEDADES_DEMO;

    const indiceInicio = (paginaActual - 1) * propiedadesPorPagina;
    const indiceFin = indiceInicio + propiedadesPorPagina;
    const propiedadesPaginadas = lista.slice(indiceInicio, indiceFin);
    const totalPaginas = Math.ceil(lista.length / propiedadesPorPagina);

    return (
        <div className="page-container">
            <Header />

            {/* ---- Hero · Exaggerated Minimalism (editorial asimétrico) ---- */}
            <section className="lgea-hero" style={{ backgroundImage: `url(${imgUno})` }}>
                <Container className="lgea-hero__inner">
                    <Eyebrow>Construcciones residenciales · Cumbayá & Tumbaco</Eyebrow>

                    <div className="lgea-hero__main">
                        <h1 className="lgea-hero__title">
                            Espacios diseñados
                            <span className="lgea-hero__title-accent">para la vida que mereces.</span>
                        </h1>

                        <div className="lgea-hero__aside">
                            <p className="lgea-hero__lead lede">
                                Trece años construyendo proyectos residenciales de calidad.
                                Explora las propiedades disponibles y agenda una visita privada.
                            </p>
                            <div className="lgea-hero__cta">
                                <Button variant="accent" size="lg" onClick={scrollAListado}>
                                    Ver propiedades
                                </Button>
                                <Button variant="secondary" size="lg" onClick={() => navigate("/about")}>
                                    Conocer la firma
                                </Button>
                            </div>
                        </div>
                    </div>

                    <dl className="lgea-hero__stats">
                        <div><dt>Años de trayectoria</dt><dd><CountUp end={13} suffix="+" /></dd></div>
                        <div><dt>Zonas exclusivas</dt><dd><CountUp end={2} /></dd></div>
                        <div><dt>Enfoque</dt><dd>Residencial premium</dd></div>
                    </dl>
                </Container>
            </section>

            {/* ---- Listado de propiedades ---- */}
            <section id="propiedades" className="home-listado section">
                <Container>
                    <div className="home-listado__head">
                        <SectionHeader
                            eyebrow="Portafolio"
                            title="Propiedades destacadas"
                            lede="Disponibles ahora en nuestras zonas de Cumbayá y Tumbaco."
                        />
                        <Button variant="secondary" onClick={() => setMostrarModalFiltros(true)}>
                            Filtros
                        </Button>
                    </div>

                    <div className="propiedades-grid">
                        {propiedadesPaginadas.map((p) => (
                            <PropertyCard
                                key={p._id}
                                propiedad={p}
                                onSelect={handleVerMas}
                                formatPrecio={formatPrecio}
                            />
                        ))}
                    </div>

                    {lista.length > propiedadesPorPagina && (
                        <nav className="home-paginacion" aria-label="Paginación de propiedades">
                            <Button
                                variant="secondary"
                                onClick={() => paginaActual > 1 && setPaginaActual(paginaActual - 1)}
                                disabled={paginaActual === 1}
                            >
                                ← Anterior
                            </Button>
                            <span className="home-paginacion__estado">
                                Página {paginaActual} de {totalPaginas}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() => indiceFin < lista.length && setPaginaActual(paginaActual + 1)}
                                disabled={indiceFin >= lista.length}
                            >
                                Siguiente →
                            </Button>
                        </nav>
                    )}
                </Container>
            </section>

            {/* ---- Modal de filtros ---- */}
            {mostrarModalFiltros && (
                <div
                    className="modal-filtros-overlay"
                    onClick={() => setMostrarModalFiltros(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="filtros-titulo"
                >
                    <div className="modal-filtros" onClick={(e) => e.stopPropagation()}>
                        <h3 id="filtros-titulo">Filtrar propiedades</h3>
                        <div className="filtros-grid">
                            <label className="field">
                                <span>Min m²</span>
                                <input type="number" name="metrosMin" value={filtros.metrosMin} onChange={handleFiltroChange} />
                            </label>
                            <label className="field">
                                <span>Max m²</span>
                                <input type="number" name="metrosMax" value={filtros.metrosMax} onChange={handleFiltroChange} />
                            </label>
                            <label className="field">
                                <span>Habitaciones</span>
                                <input type="number" name="habitaciones" value={filtros.habitaciones} onChange={handleFiltroChange} />
                            </label>
                            <label className="field">
                                <span>Parqueaderos</span>
                                <input type="number" name="parqueaderos" value={filtros.parqueaderos} onChange={handleFiltroChange} />
                            </label>
                            <label className="field filtros-grid__full">
                                <span>Tipo</span>
                                <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange}>
                                    <option value="">Todos los tipos</option>
                                    <option value="casa">Casa</option>
                                    <option value="departamento">Departamento</option>
                                    <option value="terreno">Terreno</option>
                                </select>
                            </label>
                        </div>
                        <div className="modal-filtros-botones">
                            <Button variant="secondary" onClick={() => setFiltros(FILTROS_VACIOS)}>
                                Limpiar
                            </Button>
                            <Button onClick={() => { aplicarFiltros(); setMostrarModalFiltros(false); }}>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Home;
