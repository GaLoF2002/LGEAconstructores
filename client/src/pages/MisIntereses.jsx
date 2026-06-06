import { useEffect, useState } from "react";
import { getMisIntereses } from "../services/interesService";
import { PropertyCard } from "../components/ui";
import { TbHeart } from "react-icons/tb";
import './MisIntereses.css';

const formatPrecio = (v) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);

const MisIntereses = ({ setActiveSection, setPropiedadSeleccionada }) => {
    const [intereses, setIntereses] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMisIntereses();
                setIntereses(res.data);
            } catch (error) {
                console.error("Error al obtener intereses:", error);
            } finally {
                setCargando(false);
            }
        };
        fetch();
    }, []);

    const handleVerMas = (id) => {
        setPropiedadSeleccionada(id);
        setActiveSection("ver-propiedad");
    };

    // Sólo intereses cuya propiedad sigue existiendo.
    const propiedades = intereses
        .map((i) => i.propiedad)
        .filter(Boolean);

    return (
        <div className="mis-intereses-container">
            <header className="mis-intereses-header">
                <span className="mis-intereses-eyebrow">Tu selección</span>
                <h2 className="mis-intereses-titulo">Propiedades que te interesan</h2>
            </header>

            {cargando ? (
                <p className="mis-intereses-vacio">Cargando tus propiedades…</p>
            ) : propiedades.length === 0 ? (
                <div className="mis-intereses-empty">
                    <TbHeart aria-hidden="true" />
                    <p>Aún no has marcado propiedades como interesantes.</p>
                    <button onClick={() => setActiveSection("inicio")}>Explorar propiedades</button>
                </div>
            ) : (
                <div className="propiedades-grid">
                    {propiedades.map((p) => (
                        <PropertyCard
                            key={p._id}
                            propiedad={p}
                            onSelect={handleVerMas}
                            formatPrecio={formatPrecio}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisIntereses;
