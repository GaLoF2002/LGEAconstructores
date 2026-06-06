// models/Cita.js
import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
    propiedad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Propiedad",
        required: true
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String, // ejemplo "10:00"
        required: true
    },
    estado: {
        type: String,
        enum: ["pendiente", "aceptada", "cancelada"],
        default: "pendiente"
    },
    mensaje: {
        type: String
    },
    ejecutada: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índices para consultas frecuentes (citas por vendedor/cliente/propiedad, rangos de fecha, reportes).
citaSchema.index({ vendedor: 1, createdAt: -1 });
citaSchema.index({ cliente: 1, createdAt: -1 });
citaSchema.index({ propiedad: 1 });
citaSchema.index({ fecha: 1 });
citaSchema.index({ createdAt: -1 });

export default mongoose.model("Cita", citaSchema);
