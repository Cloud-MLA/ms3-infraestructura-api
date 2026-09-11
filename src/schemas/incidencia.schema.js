const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const incidenciaJsonSchema = {
    type: "object",
    properties: {
        tipo_incidencia: { 
            type: "string", 
            enum: ['Falla_Radar', 'Inundacion', 'Falta_Combustible', 'Saturacion_Vial', 'Manga_Inoperativa', 'Otro'] // Valores exactos[cite: 1]
        },
        gravedad: { 
            type: "string", 
            enum: ['Leve', 'Moderada', 'Alta', 'Critica'] // Sin tildes[cite: 1]
        },
        descripcion: { type: "string", minLength: 5 },
        recurso_id: { type: "string" } // El ID de MongoDB viaja como string en el JSON
    },
    required: ["tipo_incidencia", "gravedad", "descripcion"],
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