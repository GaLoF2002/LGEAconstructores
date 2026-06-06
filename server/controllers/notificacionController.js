import Notificacion from "../models/Notificacion.js";

// Obtener todas las notificaciones del usuario logueado
// Obtener solo las notificaciones no leídas
export const obtenerNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.user._id;
        const notificaciones = await Notificacion.find({
            usuario: usuarioId,
            leida: false // 👈 Solo no leídas
        }).sort({ fecha: -1 });

        res.json(notificaciones);
    } catch (error) {
        console.error("❌ Error al obtener notificaciones:", error);
        res.status(500).json({ msg: "Error al obtener notificaciones" });
    }
};

// Marcar una notificación como leída
export const marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.findById(id);

        if (!notificacion) {
            return res.status(404).json({ msg: "Notificación no encontrada" });
        }

        // Opcional: asegurarse de que le pertenece al usuario
        if (String(notificacion.usuario) !== String(req.user._id)) {
            return res.status(403).json({ msg: "No autorizado" });
        }

        notificacion.leida = true;
        await notificacion.save();

        res.json({ msg: "Notificación marcada como leída" });
    } catch (error) {
        console.error("❌ Error al marcar notificación:", error);
        res.status(500).json({ msg: "Error al marcar como leída" });
    }
};

// Eliminar una notificación
export const eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.findById(id);

        if (!notificacion) {
            return res.status(404).json({ msg: "Notificación no encontrada" });
        }

        if (String(notificacion.usuario) !== String(req.user._id)) {
            return res.status(403).json({ msg: "No autorizado" });
        }

        await notificacion.deleteOne();
        res.json({ msg: "Notificación eliminada" });
    } catch (error) {
        console.error("❌ Error al eliminar notificación:", error);
        res.status(500).json({ msg: "Error al eliminar notificación" });
    }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req, res) => {
    try {
        const usuarioId = req.user._id;

        await Notificacion.updateMany(
            { usuario: usuarioId, leida: false },
            { $set: { leida: true } }
        );

        res.json({ msg: "Todas las notificaciones marcadas como leídas" });
    } catch (error) {
        console.error("❌ Error al marcar todas como leídas:", error);
        res.status(500).json({ msg: "Error al marcar todas como leídas" });
    }
};
