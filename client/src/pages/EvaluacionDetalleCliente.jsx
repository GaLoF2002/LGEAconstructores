import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvaluacionPorId, getUrlDocumento } from "../services/evaluacionService";
import { useToast } from "../context/ToastContext";
import "./EvaluacionDetalleCliente.css";

const EvaluacionDetalleCliente = ({ evaluacionId }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await getEvaluacionPorId(evaluacionId);
                setDatos(res.data);
            } catch (error) {
                console.error("Error al obtener evaluación:", error);
            } finally {
                setLoading(false);
            }
        };

        if (evaluacionId) {
            fetchDatos();
        }
    }, [evaluacionId]);

    if (loading) return <p>Cargando...</p>;
    if (!datos) return <p>No se encontró información de evaluación.</p>;

    const {
        evaluacion,
        porcentaje,
        detalles,
        ingresoTotal,
        egresosTotales,
        ahorroCalculado,
        nivelPotencial,
        explicacionFinal,
        cuotaAnual,
        ingresoAnual,
        montoFinanciar,
        valorPropiedad,
        entrada30
    } = datos;

    return (
        <div className="evaluacion-container">
            <button onClick={() => navigate(-1)} className="back-button">← Regresar</button>
            <h2>Detalle de Evaluación</h2>

            <div className="seccion-doble">
                <div className="tabla-contenedor">
                    <h3>🧑 Datos del Cliente</h3>
                    <table className="tabla-simple">
                        <tbody>
                        <tr><td><strong>Nombre:</strong></td><td>{evaluacion.cliente.name}</td></tr>
                        <tr><td><strong>Correo:</strong></td><td>{evaluacion.cliente.email}</td></tr>
                        <tr><td><strong>Teléfono:</strong></td><td>{evaluacion.cliente.phone}</td></tr>
                        <tr><td><strong>Tipo de compra:</strong></td><td>{evaluacion.tipoCompra}</td></tr>
                        <tr><td><strong>Nivel Potencial:</strong></td><td>{nivelPotencial} de 15 </td></tr>
                        <tr><td><strong>Porcentaje total:</strong></td><td>{porcentaje?.toFixed(2)}%</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="tabla-contenedor">
                    <h3>📊 Detalle de la Puntuación</h3>
                    <table className="tabla-simple">
                        <tbody>
                        {detalles.map((item, idx) => {
                            const [criterio, valor] = item.split(":");
                            return (
                                <tr key={idx}>
                                    <td><strong>{criterio?.trim()}:</strong></td>
                                    <td>{valor?.trim()}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>


            </div>

            {evaluacion.tipoCompra === "credito" && (
                <>
                    <div className="seccion-doble">
                        <div className="tabla-contenedor">
                            <h4>💰 Información Financiera</h4>
                            <table className="tabla-simple">
                                <tbody>
                                <tr><td><strong>Ingresos:</strong></td><td>${ingresoTotal}</td></tr>
                                <tr><td><strong>Egresos:</strong></td><td>${egresosTotales}</td></tr>
                                <tr><td><strong>Ahorro mensual:</strong></td><td>${ahorroCalculado}</td></tr>
                                <tr><td><strong>Ingreso anual:</strong></td><td>${ingresoAnual?.toFixed(2)}</td></tr>
                                <tr><td><strong>Buró:</strong></td><td>{evaluacion.buro}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="tabla-contenedor">
                            <h4>🏠 Información del Crédito</h4>
                            <table className="tabla-simple">
                                <tbody>
                                <tr><td><strong>Valor propiedad:</strong></td><td>${valorPropiedad}</td></tr>
                                <tr><td><strong>Entrada del 30%:</strong></td><td>${entrada30}</td></tr>
                                <tr><td><strong>Plazo del crédito:</strong></td><td>{evaluacion.plazoCreditoAnios} años</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <div className="explicacion-final">
                <h4>📌 Explicación del resultado</h4>
                <p>{explicacionFinal}</p>
            </div>

            <h4>📎 Documentos Adjuntos</h4>
            <ul>
                {(evaluacion.documentos || []).map((doc, i) => (
                    <li key={i}>
                        <button
                            type="button"
                            className="link-doc"
                            onClick={async () => {
                                try {
                                    const { data } = await getUrlDocumento(evaluacion._id, i);
                                    window.open(data.url, "_blank", "noopener,noreferrer");
                                } catch {
                                    toast.error("No se pudo abrir el documento. Intenta de nuevo.");
                                }
                            }}
                        >
                            Documento {i + 1}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="evaluacion-equifax">
                <h4>🔍 ¿Quieres una evaluación más detallada?</h4>
                <p>
                    Puedes obtener el score financiero completo y evaluación detallada con Equifax dando clic
                    <a
                        href="https://www.equifax.com.ec/miscreditos/checkout?codPaquete=48&campana=0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        &nbsp;aquí
                    </a>.
                </p>
            </div>

        </div>
    );
};

export default EvaluacionDetalleCliente;
