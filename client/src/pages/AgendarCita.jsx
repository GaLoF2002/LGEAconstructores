import React, { useEffect, useState, useContext } from "react";
import { getPropiedadPorId } from "../services/propiedadService";
import { getDisponibilidadPorVendedor, getMisCitas, crearCita } from "../services/agendamientoService";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { TbArrowLeft } from "react-icons/tb";
import "./AgendarCita.css";

const AgendarCita = ({ propiedadId, onCitaAgendada, setActiveSection }) => {
    const { user } = useContext(AuthContext);
    const toast = useToast();
    const volverAPropiedad = () => {
        if (setActiveSection) setActiveSection("ver-propiedad");
        else onCitaAgendada?.();
    };
    const [propiedad, setPropiedad] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [citasExistentes, setCitasExistentes] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState("");
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resProp = await getPropiedadPorId(propiedadId);
                setPropiedad(resProp.data);

                const vendedorId = resProp.data.creadoPor._id;
                const resDisp = await getDisponibilidadPorVendedor(vendedorId);
                setDisponibilidad(resDisp.data);

                const resCitas = await getMisCitas();
                setCitasExistentes(resCitas.data);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        if (propiedadId) {
            cargarDatos();
        }
    }, [propiedadId]);

    const diasSiguientes = generarSieteDias();

    const handleAgendarCita = async () => {
        if (!fechaSeleccionada || !horaSeleccionada) {
            toast.error("Debes seleccionar fecha y hora");
            return;
        }

        try {
            await crearCita({
                propiedad: propiedad._id,
                fecha: fechaSeleccionada,
                hora: horaSeleccionada,
                mensaje: mensaje || "Me gustaría visitar la propiedad",
            });

            toast.success("¡Cita agendada correctamente!");
            setMensaje("");

            const resCitasActualizadas = await getMisCitas();
            setCitasExistentes(resCitasActualizadas.data);

            setTimeout(() => {
                volverAPropiedad();
            }, 1500);
        } catch (error) {
            console.error("❌ Error al agendar cita:", error.response?.data || error.message);
            toast.error("No se pudo agendar la cita. Verifica los datos e intenta de nuevo.");
        }
    };

    const estaDisponible = (fecha, hora, diaSemana) => {
        const disponible = disponibilidad.find((d) => d.diaSemana === diaSemana);
        if (!disponible) return false;

        const dentroHorario = hora >= disponible.horaInicio && hora < disponible.horaFin;
        const citaExiste = citasExistentes.some(c =>
            new Date(c.fecha).toISOString().slice(0, 10) === fecha && c.hora === hora && c.estado !== "cancelada"
        );

        return dentroHorario && !citaExiste;
    };

    if (!propiedad) return <p>Cargando información de la propiedad...</p>;

    return (
        <div className="agendar-cita-container">
            {setActiveSection && (
                <button className="btn-volver" onClick={volverAPropiedad}>
                    <TbArrowLeft aria-hidden="true" /> Volver a la propiedad
                </button>
            )}
            <h2 className="agendar-cita-titulo">Agendar Cita para: {propiedad.titulo}</h2>

            <div className="calendario-container">
                {diasSiguientes.map((dia) => (
                    <div key={dia.fecha} className="dia-container">
                        <h3 className="dia-titulo">{dia.diaSemana} ({dia.fecha})</h3>
                        <div className="horas-container">
                            {generarHoras("08:00", "18:00").map((hora) => {
                                const disponible = estaDisponible(dia.fecha, hora, dia.diaSemana);
                                return (
                                    <button
                                        key={`${dia.fecha}-${hora}`}
                                        className={`hora-boton ${disponible ? 'disponible' : 'no-disponible'}`}
                                        disabled={!disponible}
                                        onClick={() => {
                                            setFechaSeleccionada(dia.fecha);
                                            setHoraSeleccionada(hora);
                                        }}
                                    >
                                        {hora}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {fechaSeleccionada && horaSeleccionada && (
                <div className="seleccion-cita-confirmacion">
                    <p>Seleccionaste: <strong>{fechaSeleccionada} a las {horaSeleccionada}</strong></p>
                    <div className="confirmacion-container">
                        <button className="confirmar-boton" onClick={handleAgendarCita}>Confirmar Cita</button>
                        <button className="cancelar-boton" onClick={volverAPropiedad}>Cancelar</button>
                        {mensaje && <p className="mensaje-cita-confirmacion">{mensaje}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const generarSieteDias = () => {
    const dias = [];
    const nombresDias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setHours(12, 0, 0, 0); // prevenir desfases por UTC
        fecha.setDate(fecha.getDate() + i);
        const diaSemana = fecha.toLocaleDateString("es-EC", { weekday: "long" }).toLowerCase();
        const fechaStr = fecha.toISOString().slice(0, 10);
        dias.push({ diaSemana, fecha: fechaStr });
    }
    return dias;
};

const generarHoras = (inicio, fin) => {
    const horas = [];
    let hIni = parseInt(inicio.split(":" )[0]);
    const hFin = parseInt(fin.split(":" )[0]);
    while (hIni < hFin) {
        horas.push(`${hIni.toString().padStart(2, "0")}:00`);
        hIni++;
    }
    return horas;
};

export default AgendarCita;
