import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, //
    role: { type: String, default: 'cliente', enum: ['admin', 'vendedor', 'cliente'] },

    // 🔹 Nuevos campos opcionales para vendedores
    codigoVendedor: { type: String },
    inmobiliaria: { type: String },
    genero: { type: String, enum: ['masculino', 'femenino', 'otro'] },

    resetToken: { type: String },
    resetTokenExpires: { type: Date },

    // Incrementado en cada logout/password change para invalidar JWTs previos.
    tokenVersion: { type: Number, default: 0 }
});

export default mongoose.model('User', userSchema);
