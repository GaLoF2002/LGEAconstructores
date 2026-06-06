import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    getMisCitas,
    cambiarEstadoCita,
    getDisponibilidadPorVendedor
} from "../services/agendamientoService";
import "./GestionarCitasVendedor.css"; // Importa el archivo de estilos

const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const GestionarCitasVendedor = () => {
    const { user } = useContext(AuthContext);
    const [citasPendientes, setCitasPendientes] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [horasOcupadas, setHorasOcupadas] = useState({});

    // 🔍 LOG DE USER
    console.log("👤 User en componente:", user);

    const obtenerCitas = async () => {
        console.log("🚀 Ejecutando obtenerCitas");
        try {
            const res = await getMisCitas();
            console.log("📊 Datos de getMisCitas:", res.data);

            const pendientes = res.data.filter(c => c.estado === "pendiente");
            setCitasPendientes(pendientes);

            // Procesar horas ocupadas
            const ocupadas = {};
            res.data.filter(c => c.estado === "aceptada").forEach(c => {
                const dia = new Date(c.fecha).toLocaleString("es-EC", { weekday: "long" });
                if (!ocupadas[dia]) ocupadas[dia] = [];
                ocupadas[dia].push({ hora: c.hora, propiedad: c.propiedad.titulo });
            });
            setHorasOcupadas(ocupadas);
        } catch (error) {
            console.error("❌ Error al obtener citas:", error.response ? error.response.data : error.message);
        }
    };

    const obtenerDisponibilidad = async () => {
        try {
            const res = await getDisponibilidadPorVendedor(user._id);
            console.log("📅 Disponibilidad obtenida:", res.data);
            setDisponibilidad(res.data);
        } catch (error) {
            console.error("❌ Error al obtener disponibilidad:", error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        console.log("🔥 useEffect ejecutado - User:", user);

        if (user && user._id) {
            console.log("✅ User._id está definido:", user._id);
            obtenerCitas();
            obtenerDisponibilidad();
        } else {
            console.log("⚠️ User no está definido o no tiene _id");
        }
    }, [user]);

    const manejarCita = async (id, estado) => {
        await cambiarEstadoCita(id, estado);
        await obtenerCitas();
    };

    return (
        <div className="gestionar-citas-container">
            <h2 className="titulo-seccion">Mis Citas Pendientes</h2>
            {citasPendientes.length === 0 ? (
                <p className="sin-citas">No tienes citas pendientes.</p>
            ) : (
                <ul className="lista-citas">
                    {citasPendientes.map(c => (
                        <li key={c._id} className="item-cita">
                            <div className="info-cita">
                                <span className="fecha-cita">{new Date(c.fecha).toLocaleDateString()}</span>
                                <span className="hora-cita">a las {c.hora}</span>
                            </div>
                            <div className="detalle-cita">
                                <strong>Propiedad:</strong> <span className="propiedad-cita">{c.propiedad.titulo}</span>
                                <strong>Cliente:</strong> <span className="cliente-cita">{c.cliente.name}</span>
                            </div>
                            <div className="acciones-cita">
                                <button className="boton-aceptar" onClick={() => manejarCita(c._id, "aceptada")}>Aceptar</button>
                                <button className="boton-rechazar" onClick={() => manejarCita(c._id, "cancelada")}>Rechazar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="titulo-seccion">Mi Calendario Semanal</h2>
            <div className="calendario-semanal">
                {diasSemana.map(dia => {
                    const disp = disponibilidad.find(d => d.diaSemana === dia);
                    if (!disp) return null;

                    const horasDisponibles = [];
                    let inicio = parseInt(disp.horaInicio.split(":")[0]);
                    let fin = parseInt(disp.horaFin.split(":")[0]);

                    for (let h = inicio; h <= fin; h++) {
                        const horaTexto = `${h.toString().padStart(2, '0')}:00`;
                        const ocupado = horasOcupadas[dia]?.find(h => h.hora === horaTexto);
                        horasDisponibles.push(
                            <span key={horaTexto} className={`hora-disponible ${ocupado ? 'ocupado' : 'libre'}`}>
                                {horaTexto} {ocupado ? `(${ocupado.propiedad})` : ""}
                            </span>
                        );
                    }

                    return (
                        <div key={dia} className="dia-semana">
                            <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}</strong>:
                            <div className="horas-disponibles">{horasDisponibles}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GestionarCitasVendedor;