const express = require('express');
const router = express.Router();
const { crearRecurso,
        obtenerRecursos,
        obtenerRecursoPorId,
        modificarRecurso
} = require('../controllers/recurso.controller');


router.post('/', crearRecurso);

router.get('/', obtenerRecursos);

router.get('/:id', obtenerRecursoPorId);

router.patch('/:id/estado', modificarRecurso);

module.exports = router;