import mongoose from "mongoose";

const disponibilidadSchema = new mongoose.Schema({
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    diaSemana: {
        type: String,
        enum: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
        required: true
    },
    horaInicio: {
        type: String, // Ej: "08:00"
        required: true
    },
    horaFin: {
        type: String, // Ej: "16:00"
        required: true
    }
}, {
    timestamps: true
});

// Índice: disponibilidad consultada por vendedor (agendamiento).
disponibilidadSchema.index({ vendedor: 1 });

export default mongoose.model("DisponibilidadVendedor", disponibilidadSchema);
