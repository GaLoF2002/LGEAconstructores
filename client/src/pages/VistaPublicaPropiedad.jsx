import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropiedadPorId } from "../services/propiedadService";
import { PropertyGallery } from "../components/ui";
import usePageMeta from "../hooks/usePageMeta";
import { TbBed, TbBath, TbCar, TbRuler2, TbMapPin, TbArrowLeft } from "react-icons/tb";
import "./VistaPublicaPropiedad.css";
const API_URL = import.meta.env.VITE_API_URL;

const formatPrecio = (v) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);

const VistaPublicaPropiedad = ({ propiedadId, volverA, setActiveSection }) => {
    const { id } = useParams();
    const idActivo = propiedadId || id;   // funciona como ruta pública (/propiedad/:id) o embebida
    const [propiedad, setPropiedad] = useState(null);

    useEffect(() => {
        if (!idActivo) return;
        const fetch = async () => {
            try {
                const res = await getPropiedadPorId(idActivo);
                setPropiedad(res.data);
            } catch (err) {
                console.error("Error al obtener propiedad pública", err);
            }
        };

        fetch();
    }, [idActivo]);

    usePageMeta(
        propiedad
            ? {
                title: `${propiedad.titulo} — ${propiedad.tipo} en ${propiedad.ubicacion}`,
                description: (propiedad.descripcion || `${propiedad.tipo} en ${propiedad.ubicacion}: ${propiedad.habitaciones} habitaciones, ${propiedad.banos} baños, ${propiedad.metrosCuadrados} m².`).slice(0, 160),
                path: `/propiedad/${idActivo}`,
                jsonLd: {
                    "@context": "https://schema.org",
                    "@type": "Residence",
                    name: propiedad.titulo,
                    description: propiedad.descripcion,
                    image: propiedad.imagenes,
                    numberOfRooms: propiedad.habitaciones,
                    floorSize: { "@type": "QuantitativeValue", value: propiedad.metrosCuadrados, unitCode: "MTK" },
                    address: { "@type": "PostalAddress", addressLocality: propiedad.ubicacion, addressCountry: "EC" },
                    offers: { "@type": "Offer", price: propiedad.precio, priceCurrency: "USD", availability: propiedad.estado === "disponible" ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
                },
            }
            : { title: "Propiedad" }
    );

    if (!propiedad) return <p className="loading">Cargando propiedad...</p>;

    return (
        <div className="detalle-prop-container">
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

            <div className="detalle-precio-line">
                <span className="detalle-precio-line__label">Precio de venta</span>
                <span className="detalle-precio-line__valor">{formatPrecio(propiedad.precio)}</span>
            </div>

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

            {/* Botón de volver solo si se pasa setActiveSection (solo desde Dashboard) */}
            {setActiveSection && (
                <button className="btn-volver" onClick={() => setActiveSection(volverA || "propiedades")}>
                    <TbArrowLeft aria-hidden="true" /> Volver
                </button>
            )}
        </div>
    );
};

export default VistaPublicaPropiedad;
