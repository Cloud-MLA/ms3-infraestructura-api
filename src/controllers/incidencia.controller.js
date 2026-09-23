const Incidencia = require('../models/incidencia.model');
const { validarIncidencia } = require('../schemas/incidencia.schema');
const {
    verificarVuelo,
    MS2DependenciaError
} = require('../services/ms2Client');
const {
    errorValidacion,
    errorNoEncontrado,
    errorVueloNoExiste,
    errorIncidenciaYaCerrada,
    errorDependencia,
    errorRespuesta
} = require('../utils/errores');

// POST /incidencias — MS3-05: valida retrasa_vuelos[] contra MS2
const crearIncidencia = async (req, res) => {
    try {
        const esValido = validarIncidencia(req.body);
        if (!esValido) {
            return errorValidacion(res, validarIncidencia.errors);
        }

        for (const v of req.body.retrasa_vuelos) {
            const existente = await verificarVuelo(v.vuelo_id);
            if (!existente.exists || existente.estado === "Cancelado") {
                return errorVueloNoExiste(res, v.vuelo_id);
            }
        }

        const nuevaIncidencia = new Incidencia(req.body);
        await nuevaIncidencia.save();

        res.status(201).json({
            mensaje: "incidencia creada con éxito",
            datos: nuevaIncidencia
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

// GET /incidencias?tipo=&desde=&hasta=
const obtenerIncidencias = async (req, res) => {
    try {
        const { tipo, desde, hasta } = req.query;

        let queryMongo = {};

        if (tipo) {
            queryMongo.tipo_incidencia = tipo;
        }
        if (desde || hasta) {
            queryMongo.fecha_reporte = {};
            if (desde) {
                queryMongo.fecha_reporte.$gte = new Date(desde);
            }
            if (hasta) {
                queryMongo.fecha_reporte.$lte = new Date(hasta);
            }
        }
        const incidencias = await Incidencia.find(queryMongo);

        res.status(200).json(incidencias);
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "Error al obtener incidencias"
        });
    }
};

// GET /incidencias/{id} — la PK es el campo numérico `id`, no el _id de Mongo
const obtenerIncidenciasPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findOne({ id });

        if (!incidencia) {
            return errorNoEncontrado(res, "incidencia");
        }

        res.status(200).json(incidencia);
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "ID no válido o error de servidor"
        });
    }
};

// PATCH /incidencias/{id}/cierre — MS3-06: setea fecha_cierre; una ya cerrada no se re-cierra
const cerrarIncidencia = async (req, res) => {
    try {
        const { id } = req.params;

        const incidencia = await Incidencia.findOne({ id });
        if (!incidencia) {
            return errorNoEncontrado(res, "incidencia");
        }
        if (incidencia.fecha_cierre) {
            return errorIncidenciaYaCerrada(res, id);
        }

        const incidenciaCerrada = await Incidencia.findOneAndUpdate(
            { id },
            { $set: { fecha_cierre: new Date() } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            mensaje: "Incidencia cerrada exitosamente",
            datos: incidenciaCerrada
        });
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "Error interno del servidor"
        });
    }
};

module.exports = {
    crearIncidencia,
    obtenerIncidencias,
    obtenerIncidenciasPorId,
    cerrarIncidencia
};