const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const API_PREFIX = '/api/infra';

//ruticas
const healthRoutes = require('./routes/health.routes');
const recursoRoutes = require('./routes/recurso.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const asignacionesRoutes = require('./routes/asignaciones.routes');
const openapiSpec = require('./docs/openapi');
const app = express();

//what is this? xD
app.use(cors());
app.use(express.json());

// MS3-09: Swagger-UI en el mismo prefijo de negocio (nginx NO recorta /api/infra/ para
// este servicio, a diferencia de ms1) -- así no hace falta una location especial en nginx,
// a diferencia de ms2/ms4/ms5.
app.get(`${API_PREFIX}/openapi.json`, (req, res) => res.json(openapiSpec));
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(openapiSpec));

//endpoints
app.use(`${API_PREFIX}/asignaciones`, asignacionesRoutes);
app.use(`${API_PREFIX}/recursos`, recursoRoutes);
app.use(`${API_PREFIX}/incidencias`, incidenciaRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use('/api/infra', healthRoutes);
app.use('/', healthRoutes); //directamente /health

module.exports = app;