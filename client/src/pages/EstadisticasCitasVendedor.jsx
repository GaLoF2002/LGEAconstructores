import React, { useEffect, useState } from "react";
import {
    obtenerCitasDelMes,
    marcarCitaComoEjecutada
} from "../services/estadisticasCitasService.js";
import "./EstadisticasCitasVendedor.css"; // Importa tu archivo CSS aquí

const EstadisticasCitasVendedor = () => {
    const [citas, setCitas] = useState([]);
    const [ejecutadas, setEjecutadas] = useState([]);

    const fetchCitas = async () => {
        try {
            const res = await obtenerCitasDelMes();
            setCitas(res.data);
            setEjecutadas(res.data.filter(c => c.ejecutada));
        } catch (err) {
            console.error("Error al cargar citas:", err);
        }
    };

    const marcarEjecutada = async (id) => {
        try {
            await marcarCitaComoEjecutada(id);
            fetchCitas();
        } catch (err) {
            console.error("Error al marcar cita:", err);
        }
    };

    useEffect(() => {
        fetchCitas();
    }, []);

    return (
        <div className="estadisticas-citas-container">
            <h2>📅 Citas del Mes</h2>
            <ul className="citas-lista">
                {citas.map(c => (
                    <li key={c._id} className="cita-item">
                        <p><strong>Cliente:</strong> {c.cliente.name}</p>
                        <p><strong>Propiedad:</strong> {c.propiedad.titulo}</p>
                        <p><strong>Fecha:</strong> {new Date(c.fecha).toLocaleDateString()} {c.hora}</p>
                        <p><strong>Estado:</strong> {c.estado}</p>
                        <p><strong>Ejecutada:</strong> {c.ejecutada ? "✅" : "❌"}</p>
                        {!c.ejecutada && (
                            <button onClick={() => marcarEjecutada(c._id)} className="marcar-btn">
                                Marcar como Ejecutada
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <h3>✅ Total Ejecutadas: {ejecutadas.length}</h3>
        </div>
    );
};

export default EstadisticasCitasVendedor;
