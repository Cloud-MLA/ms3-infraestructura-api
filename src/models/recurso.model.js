const mongoose = require('mongoose');

const recursoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        emun: ['manga', 'radar'],
        required: true
    },

    nombre: { type: String, required: true},

    //Caompos especificos para manga
    estado_acople: {
        type: String,
        enum: ['Libre', 'Ocupado', 'Mantenimiento']
    },

    clase_max: {
        type: String,
        emun: ['A', 'B', 'C', 'D', 'E', 'F']
    },

    //campos para radar
    frecuencia: {
        type: String,
        enum: ['Banda L', 'Banda S', 'Banda C', 'Banda X']
    }

}, {
    timestamps: true 
});

module.exports = mongoose.model('Recurso', recursoSchema, 'recursos');