import mongoose from "mongoose";

const propiedadSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, required: true },
    ubicacion: { type: String, required: true },
    metrosCuadrados: { type: Number, required: true },
    parqueaderos: { type: Number, required: true },
    habitaciones: { type: Number, required: true },
    banos: { type: Number, required: true },
    tipo: { type: String, enum: ["casa", "departamento", "terreno"], required: true },
    estado: { type: String, enum: ["disponible", "reservado", "vendido"], default: "disponible" },
    imagenes: {
        type: [String],
        validate: [array => array.length <= 10, "Máximo 10 imágenes permitidas"]
    },
    caracteristicas: [{ type: String }],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
});

// Índices: listado público ordenado por fecha, filtros por tipo/estado, "creadas por" del vendedor.
propiedadSchema.index({ createdAt: -1 });
propiedadSchema.index({ creadoPor: 1 });
propiedadSchema.index({ tipo: 1 });
propiedadSchema.index({ estado: 1 });

export default mongoose.model("Propiedad", propiedadSchema);
