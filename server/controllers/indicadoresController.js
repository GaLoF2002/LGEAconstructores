import VisitaCliente from "../models/VisitaCliente.js";
import Propiedad from "../models/Propiedad.js";
import mongoose from "mongoose";

// Indicadores mensuales
export const obtenerIndicadores = async (req, res) => {
    try {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        // Agrupar visitas por propiedad
        const propiedadesMasVistas = await VisitaCliente.aggregate([
            { $match: { timestamp: { $gte: inicioMes } } },
            { $group: { _id: "$propiedad", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "propiedads",
                    localField: "_id",
                    foreignField: "_id",
                    as: "propiedad"
                }
            },
            { $unwind: "$propiedad" }
        ]);

        // Agrupar por tipo
        const tiposMasVistos = await VisitaCliente.aggregate([
            { $match: { timestamp: { $gte: inicioMes } } },
            { $group: { _id: "$tipo", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        // Agrupar por filtros
        const filtrosUsados = await VisitaCliente.aggregate([
            { $match: { timestamp: { $gte: inicioMes } } },
            {
                $group: {
                    _id: {
                        habitaciones: "$habitaciones",
                        parqueaderos: "$parqueaderos"
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json({ propiedadesMasVistas, tiposMasVistos, filtrosUsados });
    } catch (error) {
        console.error("❌ Error obteniendo indicadores:", error);
        res.status(500).json({ msg: "Error obteniendo indicadores" });
    }
};

export const obtenerEstadisticasPorPropiedad = async (req, res) => {
    try {
        const { propiedadId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propiedadId)) {
            return res.status(400).json({ msg: "ID de propiedad inválido" });
        }

        // 🔹 Tiempo promedio de visualización (solo donde haya duración válida)
        const tiempoPromedio = await VisitaCliente.aggregate([
            {
                $match: {
                    propiedad: new mongoose.Types.ObjectId(propiedadId),
                    duracionSegundos: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    promedioSegundos: { $avg: "$duracionSegundos" }
                }
            }
        ]);

        const promedio = tiempoPromedio.length > 0 ? tiempoPromedio[0].promedioSegundos : 0;

        // 🔹 Clientes que más visitaron esta propiedad
        const clientesFrecuentes = await VisitaCliente.aggregate([
            { $match: { propiedad: new mongoose.Types.ObjectId(propiedadId) } },
            {
                $group: {
                    _id: "$cliente",
                    totalVisitas: { $sum: 1 }
                }
            },
            { $sort: { totalVisitas: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            { $unwind: "$cliente" }
        ]);

        // 🔹 Visitas únicas por cliente
        const visitasIndividuales = await VisitaCliente.aggregate([
            { $match: { propiedad: new mongoose.Types.ObjectId(propiedadId) } },
            {
                $group: {
                    _id: "$cliente",
                    visitas: { $sum: 1 }
                }
            }
        ]);

        // 🔹 Visitas por mes
        const visitasMensuales = await VisitaCliente.aggregate([
            { $match: { propiedad: new mongoose.Types.ObjectId(propiedadId) } },
            {
                $group: {
                    _id: {
                        anio: { $year: "$timestamp" },
                        mes: { $month: "$timestamp" }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id.anio": 1, "_id.mes": 1 } }
        ]);

        res.json({
            tiempoPromedio: Number(promedio),
            clientesFrecuentes,
            visitasIndividuales,
            visitasMensuales
        });

    } catch (error) {
        console.error("❌ Error obteniendo estadísticas por propiedad:", error);
        res.status(500).json({ msg: "Error obteniendo estadísticas por propiedad" });
    }
};
