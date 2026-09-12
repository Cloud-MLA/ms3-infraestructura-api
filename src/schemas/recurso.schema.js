const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const recursoJsonSchema = {
    type: "object",
    properties: {
        id: { type: "integer" },
        nombre_tecnico_locacion: { type: "string" },

        tipo: { 
            type: "string", 
            enum: ["manga", "radar"] 
        },
        
        manga: {
            type: "object",
            properties: {
                estado_acople: { 
                    type: "string", 
                    enum: ["Libre", "Ocupado", "Mantenimiento", "Inoperativa"] },
                longitud: { type: "number" },
                clase_max: { 
                    type: "string", 
                    enum: ["A", "B", "C", "D", "E", "F"] }
            },
            required: ["estado_acople", "longitud", "clase_max"],
            additionalProperties: false
        },
        radar: {
            type: "object",
            properties: {
                estado_radar: { type: "string" },
                frecuencia: { 
                    type: "string", 
                    enum: ["Banda L", "Banda S", "Banda C", "Banda X"] }
            },
            additionalProperties: false
        }
    },
    required: ["id", "nombre_tecnico_locacion", "tipo"],
    additionalProperties: false
};

const validarRecurso = ajv.compile(recursoJsonSchema);
module.exports = { validarRecurso };