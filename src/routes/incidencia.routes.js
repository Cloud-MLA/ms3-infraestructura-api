const express = require('express');
const router = express.Router();
const {
    crearIncidencia,
    obtenerIncidencias,
    obtenerIncidenciasPorId,
    cerrarIncidencia
} = require('../controllers/incidencia.controller');

router.post('/', crearIncidencia);

router.get('/', obtenerIncidencias);

router.get('/:id', obtenerIncidenciasPorId);

router.patch('/:id/cierre', cerrarIncidencia);

module.exports = router;