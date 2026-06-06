import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    getMisCitas,
    cambiarEstadoCita,
    getDisponibilidadPorVendedor
} from "../services/agendamientoService";
import { useToast } from "../context/ToastContext";
import "./CitasPendientesVendedor.css";

const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const horasDia = Array.from({ length: 16 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);

const normalizar = (str) =>
    str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const igualHora = (hora1, hora2) => hora1.slice(0, 5) === hora2.slice(0, 5);
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const CitasPendientesVendedor = () => {
    const { user } = useContext(AuthContext);
    const toast = useToast();
    const [citasPendientes, setCitasPendientes] = useState([]);
    const [citasAceptadas, setCitasAceptadas] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState([]);

    const obtenerCitas = async () => {
        try {
            const res = await getMisCitas();
            setCitasPendientes(res.data.filter(c => c.estado === "pendiente"));
            setCitasAceptadas(res.data.filter(c => c.estado === "aceptada"));
        } catch (error) {
            console.error("Error al obtener citas:", error);
        }
    };

    const obtenerDisponibilidad = async () => {
        try {
            const vendedorId = user._id || user.id;
            const res = await getDisponibilidadPorVendedor(vendedorId);
            setDisponibilidad(res.data);
        } catch (error) {
            console.error("Error al obtener disponibilidad:", error);
        }
    };

    const manejarCita = async (id, estado) => {
        try {
            await cambiarEstadoCita(id, estado);
            toast.success(estado === "aceptada" ? "Cita aceptada" : "Cita rechazada");
            await obtenerCitas();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            toast.error("No se pudo actualizar la cita");
        }
    };

    useEffect(() => {
        if (user && (user._id || user.id)) {
            obtenerCitas();
            obtenerDisponibilidad();
        }
    }, [user]);

    const renderHorario = () => (
        <div className="cal-wrap">
            <table className="cal-table">
                <thead>
                    <tr>
                        <th className="cal-corner" aria-hidden="true"></th>
                        {diasSemana.map(dia => (
                            <th key={dia} className="cal-dia">{capitalizar(dia)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {horasDia.map(hora => (
                        <tr key={hora}>
                            <th className="cal-hora">{hora}</th>
                            {diasSemana.map(dia => {
                                const disp = disponibilidad.find(d => d.diaSemana === dia);
                                if (!disp) return <td key={`${dia}-${hora}`} className="cal-cell" />;

                                const matchDia = (c) => {
                                    const diaCita = normalizar(
                                        new Date(c.fecha).toLocaleString("es-EC", { weekday: "long", timeZone: "UTC" })
                                    );
                                    return diaCita === normalizar(dia) && igualHora(c.hora, hora);
                                };

                                const citaAceptada = citasAceptadas.find(matchDia);
                                const citaPendiente = citasPendientes.find(matchDia);
                                const horaNum = parseInt(hora.split(":")[0]);
                                const inicio = parseInt(disp.horaInicio.split(":")[0]);
                                const fin = parseInt(disp.horaFin.split(":")[0]);

                                let cls = "cal-cell";
                                let contenido = "";
                                if (citaAceptada) { cls += " cal-cell--ocupada"; contenido = citaAceptada.propiedad.titulo; }
                                else if (citaPendiente) { cls += " cal-cell--pendiente"; contenido = citaPendiente.propiedad.titulo; }
                                else if (horaNum >= inicio && horaNum < fin) { cls += " cal-cell--libre"; contenido = "Libre"; }

                                return <td key={`${dia}-${hora}`} className={cls}>{contenido}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="cal-leyenda">
                <span><i className="cal-dot cal-dot--libre" /> Libre</span>
                <span><i className="cal-dot cal-dot--pendiente" /> Pendiente</span>
                <span><i className="cal-dot cal-dot--ocupada" /> Confirmada</span>
            </div>
        </div>
    );

    return (
        <div className="vendedor-citas-pendientes-section">
            <header className="citas-pend-header">
                <span className="citas-pend-eyebrow">Agenda</span>
                <h2>Citas pendientes</h2>
            </header>

            {citasPendientes.length === 0 ? (
                <p className="citas-pend-vacio">No tienes citas pendientes.</p>
            ) : (
                <div className="citas-grid-container">
                    {citasPendientes.map(cita => (
                        <div key={cita._id} className="cita-pendiente-item">
                            <span className="cita-badge">Pendiente</span>
                            <h3 className="cita-prop">{cita.propiedad.titulo}</h3>
                            <dl className="cita-datos">
                                <div><dt>Cliente</dt><dd>{cita.cliente.name}</dd></div>
                                <div><dt>Fecha</dt><dd>{new Date(cita.fecha).toLocaleDateString("es-EC", { timeZone: "UTC" })}</dd></div>
                                <div><dt>Hora</dt><dd>{cita.hora}</dd></div>
                                <div><dt>Mensaje</dt><dd>{cita.mensaje || "—"}</dd></div>
                            </dl>
                            <div className="citas-botones">
                                <button className="btn-aceptar" onClick={() => manejarCita(cita._id, "aceptada")}>Aceptar</button>
                                <button className="btn-rechazar" onClick={() => manejarCita(cita._id, "cancelada")}>Rechazar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <header className="citas-pend-header citas-pend-header--cal">
                <span className="citas-pend-eyebrow">Vista semanal</span>
                <h2>Mi calendario</h2>
            </header>
            {renderHorario()}
        </div>
    );
};

export default CitasPendientesVendedor;
