import mongoose from 'mongoose';

const evaluacionSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propiedadInteres: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Propiedad',
        required: true
    },

    // Información básica
    tipoCompra: {
        type: String,
        enum: ['contado', 'credito'],
        required: true
    },
    tiempoCompra: {
        type: String,
        enum: ['1mes', '2meses', '3meses', '4meses', '5meses', '6meses'],
        required: true
    },

    // Solo si tipoCompra === "credito"
    ingresos: {
        sueldo: Number,
        otros: Number,
        conyuge: Number,
        origenOtros: String
    },
    egresos: {
        alimentacion: Number,
        servicios: Number,
        arriendo: Number,
        educacion: Number,
        transporte: Number,
        salud: Number,
        vestimenta: Number,
        mantenimiento: Number,
        pagoEmpleados: Number,
        alquilerLocal: Number,
        deudas: Number,
        otros: Number
    },
    ahorroMensual: Number,

    buro: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E']
    },

    tieneInmueble: Boolean, // ✅ si tiene al menos un inmueble
    valorTotalInmuebles: Number, // ✅ valor económico estimado total de los inmuebles
    tieneEntrada30: Boolean, // ✅ indica si tiene el 30% de la propiedad como entrada
    plazoCreditoAnios: Number,// ✅ plazo del crédito en años
    antiguedadAnios: Number,
    valorPropiedad: Number,

    // Puntaje automático
    nivelPotencial: {
        type: Number,
        required: true,
        min: 1,
        max: 15 // ✅ cambia el máximo a 15, que es el valor permitido según tu lógica
    },

    porcentaje: {
        type: Number,
        min: 0,
        max: 100
    },


    // Documentos de precalificación bancaria (solo crédito)
    documentos: [String]

}, { timestamps: true });

// Índices: evaluaciones por propiedad (compradores), por cliente, y orden por fecha (reportes/scoring).
evaluacionSchema.index({ propiedadInteres: 1 });
evaluacionSchema.index({ cliente: 1 });
evaluacionSchema.index({ createdAt: -1 });

export default mongoose.model('EvaluacionCompra', evaluacionSchema);
