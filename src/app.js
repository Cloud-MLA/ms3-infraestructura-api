const express = require('express');
const cors = require('cors');

const API_PREFIX = '/api/infra';

//ruticas
const healthRoutes = require('./routes/health.routes');
const recursoRoutes = require('./routes/recurso.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(`${API_PREFIX}/recursos`, recursoRoutes);

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use('/api/infra', healthRoutes);
app.use('/', healthRoutes); //directamente /health

module.exports = app;