const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoints base
app.use('/api/infra', healthRoutes);
app.use('/', healthRoutes); // Para que responda también directamente en /health

module.exports = app;