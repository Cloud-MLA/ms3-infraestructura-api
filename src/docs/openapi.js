// Spec OpenAPI 3.0 de MS3 (Infraestructura / Incidencias). Servido por swagger-ui-express
// en API_PREFIX + /docs (ver src/app.js). MS3-09 del plan.
//
// Escrito a mano a partir de las rutas reales (src/routes/*.routes.js) y los schemas de
// validacion Ajv (src/schemas/*.schema.js) -- no autogenerado, para que quede exacto.

const ERROR_SCHEMA = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'VALIDACION' },
        message: { type: 'string' },
        status: { type: 'integer' },
        details: { type: 'array', items: { type: 'object' }, nullable: true },
        service: { type: 'string', example: 'ms3-infraestructura-api' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
};

const RECURSO_SCHEMA = {
  type: 'object',
  required: ['id', 'nombre_tecnico_locacion', 'tipo'],
  properties: {
    id: { type: 'integer' },
    nombre_tecnico_locacion: { type: 'string' },
    tipo: { type: 'string', enum: ['manga', 'radar'] },
    manga: {
      type: 'object',
      properties: {
        estado_acople: { type: 'string', enum: ['Libre', 'Ocupado', 'Mantenimiento', 'Inoperativa'] },
        longitud: { type: 'number' },
        clase_max: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F'] },
      },
    },
    radar: {
      type: 'object',
      properties: {
        rango_alcance: { type: 'number' },
        estado_radar: { type: 'string' },
        frecuencia: { type: 'string', enum: ['Banda L', 'Banda S', 'Banda C', 'Banda X'] },
      },
    },
  },
};

const INCIDENCIA_SCHEMA = {
  type: 'object',
  required: ['id', 'gravedad', 'descripcion', 'tipo_incidencia', 'fecha_reporte', 'afecta_recursos', 'retrasa_vuelos'],
  properties: {
    id: { type: 'integer' },
    gravedad: { type: 'string', enum: ['Leve', 'Moderada', 'Alta', 'Critica'] },
    descripcion: { type: 'string' },
    tipo_incidencia: {
      type: 'string',
      enum: ['Falla_Radar', 'Inundacion', 'Falta_Combustible', 'Saturacion_Vial', 'Manga_Inoperativa', 'Otro'],
    },
    fecha_reporte: { type: 'string', format: 'date-time' },
    fecha_cierre: { type: 'string', format: 'date-time', nullable: true },
    afecta_recursos: {
      type: 'array',
      items: { type: 'object', required: ['recurso_id'], properties: { recurso_id: { type: 'integer' } } },
    },
    retrasa_vuelos: {
      type: 'array',
      items: { type: 'object', required: ['vuelo_id'], properties: { vuelo_id: { type: 'integer' } } },
    },
  },
};

const ASIGNACION_SCHEMA = {
  type: 'object',
  required: ['recurso_id', 'vuelo_id'],
  properties: {
    recurso_id: { type: 'integer' },
    vuelo_id: { type: 'integer' },
    fecha_inicio: { type: 'string', format: 'date-time' },
    fecha_fin: { type: 'string', format: 'date-time' },
    estado_asignacion: { type: 'string', enum: ['Programada', 'En_Curso', 'Finalizada', 'Cancelada'] },
  },
};

const errorResponses = (...codes) =>
  Object.fromEntries(codes.map((c) => [c, { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }]));

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'MS3 — Infraestructura / Incidencias',
    version: '1.0.0',
    description:
      'Gestión de recursos aeroportuarios (mangas/radares), incidencias operativas y asignaciones ' +
      'vuelo↔recurso. MS3 valida el vuelo contra MS2 (GET /api/vuelos/{id}/exists) antes de crear ' +
      'una incidencia que lo referencia.',
  },
  servers: [{ url: '/api/infra', description: 'Vía API Gateway / nginx (prefijo de negocio)' }],
  tags: [
    { name: 'Salud', description: 'Healthcheck del servicio' },
    { name: 'Recursos', description: 'Mangas y radares' },
    { name: 'Incidencias', description: 'Incidencias operativas' },
    { name: 'Asignaciones', description: 'Asignación vuelo ↔ recurso' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Salud'],
        summary: 'Estado del servicio y conexión a MongoDB',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/recursos': {
      post: {
        tags: ['Recursos'],
        summary: 'Crear un recurso (manga o radar)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Recurso' } } } },
        responses: { 201: { description: 'Creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Recurso' } } } }, ...errorResponses(400, 409) },
      },
      get: {
        tags: ['Recursos'],
        summary: 'Listar recursos',
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Recurso' } } } } } },
      },
    },
    '/recursos/{id}': {
      get: {
        tags: ['Recursos'],
        summary: 'Obtener un recurso por id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Recurso' } } } }, ...errorResponses(404) },
      },
    },
    '/recursos/{id}/estado': {
      patch: {
        tags: ['Recursos'],
        summary: 'Cambiar el estado de acople/operación de un recurso',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { estado: { type: 'string', enum: ['Libre', 'Ocupado', 'Mantenimiento', 'Inoperativa'] } } } } } },
        responses: { 200: { description: 'Actualizado' }, ...errorResponses(400, 404, 422) },
      },
    },
    '/incidencias': {
      post: {
        tags: ['Incidencias'],
        summary: 'Crear una incidencia (valida vuelo_id contra MS2 si aplica)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Incidencia' } } } },
        responses: {
          201: { description: 'Creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Incidencia' } } } },
          ...errorResponses(400, 422, 502, 503),
        },
      },
      get: {
        tags: ['Incidencias'],
        summary: 'Listar incidencias',
        parameters: [
          { name: 'tipo', in: 'query', schema: { type: 'string' } },
          { name: 'desde', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Incidencia' } } } } } },
      },
    },
    '/incidencias/{id}': {
      get: {
        tags: ['Incidencias'],
        summary: 'Obtener una incidencia por id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Incidencia' } } } }, ...errorResponses(404) },
      },
    },
    '/incidencias/{id}/cierre': {
      patch: {
        tags: ['Incidencias'],
        summary: 'Cerrar una incidencia (no se puede re-cerrar una ya cerrada)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Cerrada' }, ...errorResponses(404, 409) },
      },
    },
    '/asignaciones': {
      post: {
        tags: ['Asignaciones'],
        summary: 'Asignar un recurso a un vuelo (regla: clase de manga ≥ clase de la aeronave)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Asignacion' } } } },
        responses: { 201: { description: 'Creada' }, ...errorResponses(400, 409, 422) },
      },
      get: {
        tags: ['Asignaciones'],
        summary: 'Listar asignaciones',
        parameters: [
          { name: 'vuelo_id', in: 'query', schema: { type: 'integer' } },
          { name: 'recurso_id', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Asignacion' } } } } } },
      },
    },
  },
  components: {
    schemas: {
      Recurso: RECURSO_SCHEMA,
      Incidencia: INCIDENCIA_SCHEMA,
      Asignacion: ASIGNACION_SCHEMA,
      Error: ERROR_SCHEMA.properties.error,
    },
  },
};
