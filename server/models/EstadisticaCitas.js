// models/EstadisticaCitas.js
import mongoose from "mongoose";

const estadisticaCitasSchema = new mongoose.Schema({
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mes: {
        type: String, // Ej: "2025-06"
        required: true
    },
    citasEjecutadas: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

estadisticaCitasSchema.index({ vendedor: 1, mes: 1 }, { unique: true });

export default mongoose.model("EstadisticaCitas", estadisticaCitasSchema);
