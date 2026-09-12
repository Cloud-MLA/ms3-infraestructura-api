const mongoose = require('mongoose');

// Subesquema para manga (sin _id propio)
const mangaSchema = new mongoose.Schema({
    estado_acople: { type: String, enum: ["Libre", "Ocupado", "Mantenimiento", "Inoperativa"] },
    longitud: { type: Number },
    clase_max: { type: String, enum: ["A", "B", "C", "D", "E", "F"] }
}, { _id: false }); 

// Subesquema para Radar sin _id propio
const radarSchema = new mongoose.Schema({
    estado_radar: { type: String },
    frecuencia: { type: String, enum: ["Banda L", "Banda S", "Banda C", "Banda X"] }
}, { _id: false });

// principal
const recursoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nombre_tecnico_locacion: { type: String, required: true },
    tipo: { type: String, required: true, enum: ["manga", "radar"] },
    manga: { type: mangaSchema },
    radar: { type: radarSchema }
}, {
    collection: 'recursos',
    timestamps: false, 
    versionKey: false  
});

module.exports = mongoose.model('Recurso', recursoSchema);