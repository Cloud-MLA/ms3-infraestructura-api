const mongoose = require('mongoose');

const afectaRecursoSchema = new mongoose.Schema({
    recurso_id: { type: Number, required: true }
}, { _id: false });

const retrasaVueloSchema = new mongoose.Schema({
    vuelo_id: { type: Number, required: true }
}, { _id: false });

const incidenciaSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    gravedad: { type: String, required: true, enum: ["Leve", "Moderada", "Alta", "Critica"] },
    descripcion: { type: String, required: true },
    tipo_incidencia: { type: String, required: true, enum: ["Falla_Radar", "Inundacion", "Falta_Combustible", "Saturacion_Vial", "Manga_Inoperativa", "Otro"] },
    fecha_reporte: { type: Date, required: true },
    fecha_cierre: { type: Date, default: null }, 
    afecta_recursos: [afectaRecursoSchema],
    retrasa_vuelos: [retrasaVueloSchema]
}, {
    collection: 'incidencias',
    timestamps: false,
    versionKey: false
});

module.exports = mongoose.model('Incidencia', incidenciaSchema);