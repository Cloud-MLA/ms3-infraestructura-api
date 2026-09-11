const express = require('express');
const router = express.Router();
const {
    obtenerAsignaciones,
    crearAsignaciones
} = require('../controllers/asignacion.controller');
const { route } = require('./incidencia.routes');

router.post('/', crearAsignaciones);

router.get('/', obtenerAsignaciones);

module.exports = router;