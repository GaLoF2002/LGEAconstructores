// models/Interes.js
import mongoose from "mongoose";

const interesSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propiedad: { type: mongoose.Schema.Types.ObjectId, ref: "Propiedad", required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

interesSchema.index({ cliente: 1, propiedad: 1 }, { unique: true }); // Un cliente solo puede interesarse una vez por propiedad
interesSchema.index({ propiedad: 1 }); // Conteo de interesados por propiedad (reportes)

export default mongoose.model("Interes", interesSchema);
