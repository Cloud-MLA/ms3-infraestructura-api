const mongoose = require('mongoose');

const incidenciaSchema = new mongoose.Schema({
    tipo_incidencia: {
        type: String,
        enum: ['Falla_Radar', 'Inundacion', 'Falta_Combustible', 'Saturacion_Vial', 'Manga_Inoperativa', 'Otro'],
        required: true
    },

    gravedad: {
        type: String,
        enum: ['Leve', 'Moderada', 'Alta', 'Critica'],
        required: true
    },

    descripcion: { type: String, required: true},
    recurso_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recurso',
        required: false
    },
    fecha_reporte: { type: Date, default: Date.now}
}, {
    timestamps: true
});

module.exports = mongoose.model('Inicidencia', incidenciaSchema, 'incidencias');