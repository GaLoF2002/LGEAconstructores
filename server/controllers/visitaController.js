import VisitaCliente from '../models/VisitaCliente.js';
import Propiedad from '../models/Propiedad.js';


export const registrarVisita = async (req, res) => {
    try {
        const { propiedadId } = req.params;
        const clienteId = req.user._id;

        const propiedad = await Propiedad.findById(propiedadId);
        if (!propiedad) {
            return res.status(404).json({ msg: "Propiedad no encontrada" });
        }

        const haceUnMomento = new Date(Date.now() - 1000);

        const yaExiste = await VisitaCliente.findOne({
            propiedad: propiedadId,
            cliente: clienteId,
            timestamp: { $gte: haceUnMomento }
        });

        if (yaExiste) {
            return res.status(200).json({ msg: "Visita ya registrada recientemente" });
        }

        // Si no existe, registrar una nueva visita
        await VisitaCliente.create({
            propiedad: propiedad._id,
            cliente: clienteId,
            tipo: propiedad.tipo,
            habitaciones: propiedad.habitaciones,
            parqueaderos: propiedad.parqueaderos
        });

        return res.status(201).json({ msg: "Visita registrada correctamente" });
    } catch (error) {
        console.error("❌ Error al registrar visita:", error);
        return res.status(500).json({ msg: "Error al registrar visita" });
    }
};
export const registrarDuracionVisualizacion = async (req, res) => {
    try {
        const { propiedadId, duracionSegundos } = req.body;
        const clienteId = req.user._id;

        if (!propiedadId || !duracionSegundos) {
            return res.status(400).json({ msg: "Datos incompletos" });
        }

        // Buscar la última visita reciente de este cliente a esta propiedad
        const ultimaVisita = await VisitaCliente.findOne({
            propiedad: propiedadId,
            cliente: clienteId
        }).sort({ timestamp: -1 });

        if (!ultimaVisita) {
            return res.status(404).json({ msg: "No se encontró una visita para registrar duración" });
        }

        // Actualizar la duración
        ultimaVisita.duracionSegundos = Math.round(duracionSegundos);
        await ultimaVisita.save();

        return res.status(200).json({ msg: "Duración registrada correctamente" });
    } catch (error) {
        console.error("❌ Error al registrar duración de visualización:", error);
        return res.status(500).json({ msg: "Error al registrar duración" });
    }
};

