const Ajv =  require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const recursoJsonSchema = {
    type: "object",
    properties: {
        tipo: {
            type: "string",
            enum: ["manga", "radar"]
        },

        nombre: {type: "string", minLength: 3},
        estado_acople: {
            type: "string",
            enum: ["Libre", "Ocupado", "Mantenimiento"]
        },

        clase_max: {
            type: "string",
            enum: ["Banda L", "Banda S", "Banda C", "Banda X"]
        }
    },
    required: ["tipo", "nombre"],
    additionalProperties: false
};

const validarRecurso = ajv.compile(recursoJsonSchema);

module.exports = { validarRecurso };