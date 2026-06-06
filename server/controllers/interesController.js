// controllers/interesController.js
import Interes from "../models/Interes.js";

export const marcarInteres = async (req, res) => {
    try {
        const clienteId = req.user._id;
        const { propiedadId } = req.body;

        const yaExiste = await Interes.findOne({ cliente: clienteId, propiedad: propiedadId });
        if (yaExiste) return res.status(400).json({ mensaje: "Ya marcaste interés en esta propiedad" });

        const nuevoInteres = await Interes.create({ cliente: clienteId, propiedad: propiedadId });
        res.status(201).json(nuevoInteres);
    } catch (error) {
        console.error("Error al marcar interés:", error);
        res.status(500).json({ error: "Error al marcar interés" });
    }
};

export const obtenerInteresesPorCliente = async (req, res) => {
    try {
        const clienteId = req.user._id;
        const intereses = await Interes.find({ cliente: clienteId }).populate("propiedad");
        res.json(intereses);
    } catch (error) {
        console.error("Error al obtener intereses:", error);
        res.status(500).json({ error: "Error al obtener intereses" });
    }
};

// Desmarcar (eliminar) el interés de una propiedad por parte del cliente autenticado
export const desmarcarInteres = async (req, res) => {
    try {
        const clienteId = req.user._id;
        const { propiedadId } = req.params;

        const interes = await Interes.findOneAndDelete({ cliente: clienteId, propiedad: propiedadId });

        if (!interes) {
            return res.status(404).json({ mensaje: "No se encontró un interés para eliminar" });
        }

        res.status(200).json({ mensaje: "Interés desmarcado correctamente" });
    } catch (error) {
        console.error("Error al desmarcar interés:", error);
        res.status(500).json({ error: "Error al desmarcar interés" });
    }
};

