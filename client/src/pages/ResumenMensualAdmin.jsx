import React, { useEffect, useState } from "react";
import { obtenerResumenMensualParaAdmin } from "../services/estadisticasCitasService.js";
import "./ResumenMensualAdmin.css";

const ResumenMensualAdmin = () => {
    const [resumen, setResumen] = useState([]);

    useEffect(() => {
        const fetchResumen = async () => {
            try {
                const res = await obtenerResumenMensualParaAdmin();
                setResumen(res.data);
            } catch (err) {
                console.error("Error al obtener resumen mensual:", err);
            }
        };
        fetchResumen();
    }, []);

    return (
        <div className="resumen-container">
            <h2 className="title-resumen">📊 Resumen Mensual por Vendedor</h2>
            <div className="tabla-scroll">
                <table className="resumen-table">
                    <thead>
                    <tr>
                        <th>Vendedor</th>
                        <th>Email</th>
                        <th>Mes</th>
                        <th>Citas Ejecutadas</th>
                    </tr>
                    </thead>
                    <tbody>
                    {resumen.map((r, i) => (
                        <tr key={i}>
                            <td>{r.vendedor.name}</td>
                            <td>{r.vendedor.email}</td>
                            <td>{r.mes}</td>
                            <td>{r.citasEjecutadas}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResumenMensualAdmin;
