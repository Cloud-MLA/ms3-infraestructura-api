const express = require('express');
const cors = require('cors');

const API_PREFIX = '/api/infra';

//ruticas
const healthRoutes = require('./routes/health.routes');
const recursoRoutes = require('./routes/recurso.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const asignacionesRoutes = require('./routes/asignaciones.routes');
const app = express();

//what is this? xD
app.use(cors());
app.use(express.json());

//endpoints
app.use(`${API_PREFIX}/asignaciones`, asignacionesRoutes);
app.use(`${API_PREFIX}/recursos`, recursoRoutes);
app.use(`${API_PREFIX}/incidencias`, incidenciaRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use('/api/infra', healthRoutes);
app.use('/', healthRoutes); //directamente /health

module.exports = app;