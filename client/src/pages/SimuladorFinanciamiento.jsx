import { useEffect, useState } from "react";
import { getPropiedadPorId } from "../services/propiedadService";
import { simularFinanciamiento } from "../services/evaluacionService";
import { TbAlertTriangle, TbArrowLeft, TbCalculator } from "react-icons/tb";
import "./SimuladorFinanciamiento.css";

const formatUSD = (v) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);

/**
 * Componente: SimuladorFinanciamiento
 * Props:
 *  - propiedadId (string): id de la propiedad a simular
 *  - setActiveSection (func): función entregada por el Dashboard para navegar
 */
const SimuladorFinanciamiento = ({ propiedadId, setActiveSection }) => {
    const [propiedad, setPropiedad] = useState(null);
    const [entrada, setEntrada] = useState(30); // % entrada (mínimo 30)
    const [plazo, setPlazo] = useState(15); // años (default 15)
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        /** Carga la propiedad una sola vez */
        const fetchPropiedad = async () => {
            try {
                const res = await getPropiedadPorId(propiedadId);
                setPropiedad(res.data);
            } catch (err) {
                setError("Error al cargar la propiedad");
                console.error(err);
            }
        };

        fetchPropiedad();
    }, [propiedadId]);

    const handleCalcular = async () => {
        if (entrada < 30 || entrada > 100) {
            setError("La entrada debe estar entre 30% y 100%");
            return;
        }
        if (plazo <= 0) {
            setError("Plazo inválido");
            return;
        }

        try {
            setError("");
            setLoading(true);
            const res = await simularFinanciamiento({
                propiedadId,
                porcentajeEntrada: entrada,
                plazoAnios: plazo
            });
            setResultado(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Error al simular");
        } finally {
            setLoading(false);
        }
    };

    if (!propiedad) return <p className="loading">Cargando simulador...</p>;

    return (
        <div className="simulador-container">
            <header className="simulador-header">
                <span className="simulador-eyebrow">Financiamiento</span>
                <h2 className="simulador-titulo">Simulador de crédito hipotecario</h2>
            </header>

            {/* Datos rápidos de la propiedad */}
            <div className="simulador-resumen">
                <div>
                    <span className="simulador-resumen__lbl">Propiedad</span>
                    <span className="simulador-resumen__val">{propiedad.titulo}</span>
                </div>
                <div>
                    <span className="simulador-resumen__lbl">Precio</span>
                    <span className="simulador-resumen__val">{formatUSD(propiedad.precio)}</span>
                </div>
            </div>

            {/* Formulario de simulación */}
            <div className="simulador-form">
                <div className="campo">
                    <label htmlFor="sim-entrada">% de entrada (mín. 30%)</label>
                    <input
                        id="sim-entrada"
                        type="number"
                        min={30}
                        max={100}
                        step={1}
                        value={entrada}
                        onChange={e => setEntrada(Number(e.target.value))}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="sim-plazo">Plazo (años)</label>
                    <select id="sim-plazo" value={plazo} onChange={e => setPlazo(Number(e.target.value))}>
                        {Array.from({ length: 25 }, (_, i) => i + 1).map(anio => (
                            <option key={anio} value={anio}>{anio}</option>
                        ))}
                    </select>
                </div>

                <button className="btn-calcular" onClick={handleCalcular} disabled={loading}>
                    <TbCalculator aria-hidden="true" /> {loading ? "Calculando…" : "Calcular"}
                </button>

                {error && (
                    <p className="simulador-error" role="alert">
                        <TbAlertTriangle aria-hidden="true" /> {error}
                    </p>
                )}
            </div>

            {/* Resultado */}
            {resultado && (
                <div className="simulador-resultado">
                    <div className="simulador-cuota">
                        <span className="simulador-cuota__lbl">Cuota mensual estimada</span>
                        <span className="simulador-cuota__val">{formatUSD(resultado.cuotaMensual)}</span>
                        <span className="simulador-cuota__nota">durante {plazo} años</span>
                    </div>

                    <dl className="simulador-desglose">
                        <div><dt>Entrada ({entrada}%)</dt><dd>{formatUSD(resultado.entrada)}</dd></div>
                        <div><dt>Monto a financiar</dt><dd>{formatUSD(resultado.montoFinanciar)}</dd></div>
                        <div><dt>Tasa efectiva anual</dt><dd>{resultado.tasaEfectivaAnual}%</dd></div>
                    </dl>
                </div>
            )}

            <p className="nota-tarifario">
                Cálculo referencial basado en el tarifario BIESS 2025. Consulta el documento oficial{" "}
                <a href="https://www.biess.fin.ec/files/ley-transaparencia/tarifario/2025/tarifario/TARIFARIO-JUNIO-2025.pdf" target="_blank" rel="noopener noreferrer">aquí</a>.
            </p>

            <button className="btn-volver" onClick={() => setActiveSection("ver-propiedad")}>
                <TbArrowLeft aria-hidden="true" /> Volver a la propiedad
            </button>
        </div>
    );
};

export default SimuladorFinanciamiento;
