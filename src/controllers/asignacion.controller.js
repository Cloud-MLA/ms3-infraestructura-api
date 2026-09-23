const Asignacion = require('../models/asignacion.model');
const { validarAsignacion } = require('../schemas/asignacion.schema');
const Recurso = require('../models/recurso.model');
const {
    verificarVuelo,
    obtenerClaseAeronave,
    MS2DependenciaError
} = require('../services/ms2Client');
const {
    errorValidacion,
    errorNoEncontrado,
    errorVueloNoExiste,
    errorAcopleClase,
    errorRecursoOcupado,
    errorDependencia,
    errorRespuesta
} = require('../utils/errores');

const CLASES_OACI = ["A", "B", "C", "D", "E", "F"];

// POST /asignaciones — MS3-07
const crearAsignaciones = async (req, res) => {
    try {
        const esValido = validarAsignacion(req.body);
        if (!esValido) {
            return errorValidacion(res, validarAsignacion.errors);
        }

        const recurso = await Recurso.findOne({ id: req.body.recurso_id });
        if (!recurso) {
            return errorNoEncontrado(res, `recurso con id ${req.body.recurso_id}`);
        }

        // Regla: solo se asigna un recurso en estado Libre (solo aplica a mangas)
        if (recurso.tipo === "manga" && (!recurso.manga || recurso.manga.estado_acople !== "Libre")) {
            return errorRecursoOcupado(res, req.body.recurso_id);
        }

        // Vuelo debe existir y no estar cancelado (validación contra MS2)
        const existente = await verificarVuelo(req.body.vuelo_id);
        if (!existente.exists || existente.estado === "Cancelado") {
            return errorVueloNoExiste(res, req.body.vuelo_id);
        }

        // Regla de clase: manga.clase_max >= clase de la aeronave del vuelo
        if (recurso.tipo === "manga") {
            const claseAeronave = await obtenerClaseAeronave(req.body.vuelo_id);
            const claseMax = recurso.manga.clase_max;
            if (CLASES_OACI.indexOf(claseAeronave) > CLASES_OACI.indexOf(claseMax)) {
                return errorAcopleClase(res, claseAeronave, claseMax);
            }
        }

        const nuevaAsignacion = new Asignacion(req.body);
        await nuevaAsignacion.save();

        res.status(201).json({
            mensaje: "asignacion creada con éxito",
            datos: nuevaAsignacion
        });
    } catch (error) {
        if (error instanceof MS2DependenciaError) {
            return errorDependencia(res, error);
        }
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "Error interno del servidor"
        });
    }
};

// GET /asignaciones?vuelo_id=&recurso_id=
const obtenerAsignaciones = async (req, res) => {
    try {
        const { vuelo_id, recurso_id } = req.query;

        const filtros = {};
        if (vuelo_id) {
            filtros.vuelo_id = Number(vuelo_id);
        }
        if (recurso_id) {
            filtros.recurso_id = Number(recurso_id);
        }

        const asignaciones = await Asignacion.find(filtros);
        res.status(200).json(asignaciones);
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "Error al obtener asignaciones"
        });
    }
};

module.exports = {
    crearAsignaciones,
    obtenerAsignaciones
};