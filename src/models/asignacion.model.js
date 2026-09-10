const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema({
    recurso_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recurso', //fk hacia coleccion recursos
        required: true
    },

    vuelo_id_externo: {
        type: String,
        required: true
    },

    fecha_inicio: {
        type: Date,
        required: true
    },
    
    fecha_fin: {
        type: Date,
        required: false
    },

    estado_asignacion: {
        type: String,
        enum: ['Programada', 'En_Curso', 'Finalizada', 'Cancelada'],
        default: 'Programada'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Asignacion', asignacionSchema, 'asignaciones');