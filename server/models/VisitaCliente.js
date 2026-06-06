import mongoose from 'mongoose';

const visitaClienteSchema = new mongoose.Schema({
    propiedad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Propiedad',
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tipo: String, // ejemplo: "casa", "departamento"
    habitaciones: Number,
    parqueaderos: Number,
    timestamp: {
        type: Date,
        default: Date.now

    },
    duracionSegundos: {
        type: Number,
        default: 0 // tiempo que el cliente permaneció viendo la propiedad
    },
    estadoVisto: {
        type: String,
        default: null
    }

});

// Índices para agregaciones de reportes (visitas por propiedad, por cliente, por fecha).
visitaClienteSchema.index({ propiedad: 1 });
visitaClienteSchema.index({ cliente: 1 });
visitaClienteSchema.index({ timestamp: -1 });

export default mongoose.model('VisitaCliente', visitaClienteSchema);
