import Cita from "../models/Cita.js";
import EstadisticaCitas from "../models/EstadisticaCitas.js";


export const obtenerCitasDelMes = async (req, res) => {
    try {
        const userId = req.user._id;
        const rol = req.user.role;

        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

        let filtro = {
            fecha: { $gte: primerDiaMes, $lte: ultimoDiaMes },
            estado: "aceptada"
        };

        if (rol === "vendedor") {
            filtro.vendedor = userId;
        }

        const citas = await Cita.find(filtro)
            .populate("cliente", "name")
            .populate("propiedad", "titulo")
            .sort({ fecha: 1 });

        res.json(citas);
    } catch (error) {
        console.error("Error al obtener citas del mes:", error);
        res.status(500).json({ error: "Error al obtener citas del mes" });
    }
};

export const marcarCitaEjecutada = async (req, res) => {
    try {
        const { citaId } = req.params;
        const userId = req.user._id;

        const cita = await Cita.findById(citaId);
        if (!cita || cita.vendedor.toString() !== userId.toString()) {
            return res.status(404).json({ msg: "Cita no encontrada o no autorizada" });
        }

        if (cita.ejecutada) {
            return res.status(400).json({ msg: "Ya fue marcada como ejecutada" });
        }

        cita.ejecutada = true;
        await cita.save();

        const mesActual = new Date(cita.fecha).toISOString().slice(0, 7); // ej: "2025-06"

        const registro = await EstadisticaCitas.findOneAndUpdate(
            { vendedor: userId, mes: mesActual },
            { $inc: { citasEjecutadas: 1 } },
            { upsert: true, new: true }
        );

        res.json({ msg: "Cita marcada como ejecutada", registro });
    } catch (error) {
        console.error("Error al marcar cita como ejecutada:", error);
        res.status(500).json({ error: "Error al marcar cita como ejecutada" });
    }
};


export const obtenerResumenMensualPorVendedor = async (req, res) => {
    const userId = req.user._id;

    const registros = await EstadisticaCitas.find({ vendedor: userId }).sort({ mes: -1 });
    res.json(registros);
};

export const obtenerResumenMensualParaAdmin = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "No autorizado" });
        }

        const registros = await EstadisticaCitas.find()
            .populate("vendedor", "name email")
            .sort({ mes: -1 });

        res.json(registros);
    } catch (error) {
        console.error("Error al obtener resumen mensual para admin:", error);
        res.status(500).json({ error: "Error al obtener resumen mensual para admin" });
    }
};

