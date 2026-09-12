const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Necesario para validar fechas

const asignacionJsonSchema = {
    type: "object",
    properties: {
        recurso_id: { type: "integer" },
        vuelo_id_externo: { type: "integer" }, // ID que viene del MS2
        fecha_inicio: { type: "string", format: "date-time" }, // Valida ISO 8601 UTC[cite: 1]
        fecha_fin: { type: "string", format: "date-time" },
        estado_asignacion: {
            type: "string",
            enum: ['Programada', 'En_Curso', 'Finalizada', 'Cancelada']
        }
    },
    required: ["recurso_id", "vuelo_id_externo", "fecha_inicio"],
    additionalProperties: false
};

const validarAsignacion = ajv.compile(asignacionJsonSchema);
module.exports = { validarAsignacion };