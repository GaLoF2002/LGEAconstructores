import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    leida: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    tipo: {
        type: String,
        enum: ["cita", "recordatorio", "estado-propiedad"],
        default: "cita"
    }
});

// Índice: bandeja del usuario ordenada por fecha.
notificacionSchema.index({ usuario: 1, fecha: -1 });

export default mongoose.model("Notificacion", notificacionSchema);
