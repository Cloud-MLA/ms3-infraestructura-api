const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const incidenciaJsonSchema = {
    type: "object",
    properties: {
        id: { type: "integer" },
        
        gravedad: { 
            type: "string", 
            enum: ["Leve", "Moderada", "Alta", "Critica"] 
        },
        descripcion: { type: "string" },
        tipo_incidencia: { 
            type: "string", 
            enum: ["Falla_Radar", "Inundacion", "Falta_Combustible", "Saturacion_Vial", "Manga_Inoperativa", "Otro"] 
        },
        fecha_reporte: { 
            type: "string", 
            format: "date-time" 
        },
        fecha_cierre: { 
            type: ["string", "null"], 
            format: "date-time" 
        },
        afecta_recursos: {
            type: "array",
            items: {
                type: "object",
                properties: { recurso_id: { type: "integer" } },
                required: ["recurso_id"],
                additionalProperties: false
            }
        },
        retrasa_vuelos: {
            type: "array",
            items: {
                type: "object",
                properties: { vuelo_id: { type: "integer" } },
                required: ["vuelo_id"],
                additionalProperties: false
            }
        }
    },
    required: ["id", "gravedad", "descripcion", "tipo_incidencia", "fecha_reporte", "afecta_recursos", "retrasa_vuelos"],
    additionalProperties: false
};

const incidenciaPatchSchema = {
    type: "object",
    properties: incidenciaJsonSchema.properties,
    additionalProperties: false,
    minProperties: 1
};

const validarPatchIncidencia = ajv.compile(incidenciaPatchSchema);
const validarIncidencia = ajv.compile(incidenciaJsonSchema);
module.exports = { 
    validarIncidencia,
    validarPatchIncidencia
};