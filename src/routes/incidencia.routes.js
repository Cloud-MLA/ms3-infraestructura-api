const express = require('express');
const router = express.Router();
const {
    crearIncidencia,
    obtenerIncidencias,
    obtenerIncidenciasPorId,
    modificarIncidencia
} = require('../controllers/incidencia.controller');

router.post('/', crearIncidencia);

router.get('/', obtenerIncidencias);

router.get('/:id', obtenerIncidenciasPorId);

router.patch('/:id/cierre', modificarIncidencia);

module.exports = router;