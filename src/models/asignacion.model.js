const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema({
    recurso_id: {
        type: Number,
        required: true
    },

    vuelo_id: {
        type: Number,
        required: true
    },

    fecha_inicio: {
        type: Date,
        required: false,
        default: null
    },
    
    fecha_fin: {
        type: Date,
        required: false,
        default: null
    },

    estado_asignacion: {
        type: String,
        enum: ['Programada', 'En_Curso', 'Finalizada', 'Cancelada'],
        default: 'Programada'
    }
}, {
    collection: 'asignaciones',
    timestamps: false,
    versionKey: false
});

module.exports = mongoose.model('Asignacion', asignacionSchema);