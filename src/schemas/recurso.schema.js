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
            enum: ['A', 'B', 'C', 'D', 'E', 'F']
        }
    },
    required: ["tipo", "nombre"],
    additionalProperties: false
};

const recursoPatchSchema = {
    type: "object",
    properties: recursoJsonSchema.properties,
    additionalProperties: false,
    minProperties: 1
};

const validarRecurso = ajv.compile(recursoJsonSchema);
const validarPatchRecurso = ajv.compile(recursoPatchSchema);

module.exports = { validarRecurso, validarPatchRecurso };