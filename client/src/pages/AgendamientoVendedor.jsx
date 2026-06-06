import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { TbCalendarWeek, TbClock } from "react-icons/tb";
import {
    crearDisponibilidad,
    getDisponibilidadPorVendedor
} from "../services/agendamientoService";
import "./AgendamientoVendedor.css";

const AgendamientoVendedor = () => {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    const [diaSemana, setDiaSemana] = useState("lunes");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const [disponibilidad, setDisponibilidad] = useState([]);

    const guardarDisponibilidad = async () => {
        if (!diaSemana || !horaInicio || !horaFin) {
            toast.error("Debes llenar todos los campos");
            return;
        }
        if (horaFin <= horaInicio) {
            toast.error("La hora de fin debe ser posterior a la de inicio");
            return;
        }

        try {
            await crearDisponibilidad({ diaSemana, horaInicio, horaFin });
            toast.success("Disponibilidad guardada correctamente");

            setDiaSemana("lunes");
            setHoraInicio("");
            setHoraFin("");

            obtenerDisponibilidad();
        } catch (error) {
            console.error("Error al guardar disponibilidad:", error);
            toast.error(error.response?.data?.msg || "No se pudo guardar la disponibilidad");
        }
    };

    const obtenerDisponibilidad = async () => {
        try {
            const vendedorId = user._id || user.id;
            const res = await getDisponibilidadPorVendedor(vendedorId);
            console.log("🟢 Disponibilidad obtenida:", res.data);
            setDisponibilidad(res.data);
        } catch (err) {
            console.error("❌ Error obteniendo disponibilidad:", err);
        }
    };

    // ✅ useEffect bien controlado
    useEffect(() => {
        if (user && (user._id || user.id)) {
            console.log("👤 User listo para cargar disponibilidad:", user);
            obtenerDisponibilidad();
        }
    }, [user]);

    return (
        <div className="agendamiento-vendedor-container">
            <header className="disp-header">
                <span className="disp-eyebrow">Agenda</span>
                <h2>Configuración de disponibilidad</h2>
                <p className="disp-sub">Define los horarios en que recibirás visitas a las propiedades.</p>
            </header>

            <div className="disp-form">
                <div className="disp-campo">
                    <label htmlFor="diaSemana">Día de la semana</label>
                    <select
                        id="diaSemana"
                        value={diaSemana}
                        onChange={(e) => setDiaSemana(e.target.value)}
                    >
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miércoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sábado">Sábado</option>
                        <option value="domingo">Domingo</option>
                    </select>
                </div>

                <div className="disp-campo">
                    <label htmlFor="horaInicio">Hora de inicio</label>
                    <input
                        type="time"
                        id="horaInicio"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                    />
                </div>

                <div className="disp-campo">
                    <label htmlFor="horaFin">Hora de fin</label>
                    <input
                        type="time"
                        id="horaFin"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                    />
                </div>

                <button onClick={guardarDisponibilidad} className="boton-guardar">
                    Guardar disponibilidad
                </button>
            </div>

            <div className="disponibilidad-registrada">
                <h3>Mi disponibilidad registrada</h3>
                {disponibilidad.length === 0 ? (
                    <p className="sin-disponibilidad">No tienes disponibilidad configurada aún.</p>
                ) : (
                    <ul className="lista-disponibilidad">
                        {disponibilidad.map((item) => (
                            <li key={item._id} className="item-disponibilidad">
                                <span className="item-dia"><TbCalendarWeek aria-hidden="true" /> {item.diaSemana}</span>
                                <span className="item-hora"><TbClock aria-hidden="true" /> {item.horaInicio} – {item.horaFin}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AgendamientoVendedor;
