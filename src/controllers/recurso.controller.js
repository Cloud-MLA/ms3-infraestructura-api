const Recurso = require('../models/recurso.model');
const { validarRecurso, validarPatchRecurso } = require('../schemas/recurso.schema');
const {
    errorValidacion,
    errorNoEncontrado,
    errorRespuesta
} = require('../utils/errores');

// POST /recursos
const crearRecurso = async (req, res) => {
    try {
        const esValido = validarRecurso(req.body);
        if (!esValido) {
            return errorValidacion(res, validarRecurso.errors);
        }

        const nuevoRecurso = new Recurso(req.body);
        await nuevoRecurso.save();

        res.status(201).json({
            mensaje: "recurso creado con éxito",
            datos: nuevoRecurso
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

// GET /recursos?tipo=&estado=
const obtenerRecursos = async (req, res) => {
    try {
        const { tipo, estado } = req.query;

        const filtros = {};
        if (tipo) {
            filtros.tipo = tipo;
        }
        if (estado) {
            // el estado vive en el submódulo (manga.estado_acople | radar.estado_radar)
            filtros.$or = [
                { "manga.estado_acople": estado },
                { "radar.estado_radar": estado }
            ];
        }

        const recursos = await Recurso.find(filtros);
        res.status(200).json(recursos);
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "Error al obtener recursos"
        });
    }
};

// GET /recursos/{id} — la PK es el campo numérico `id`, no el _id de Mongo
const obtenerRecursoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const recurso = await Recurso.findOne({ id });

        if (!recurso) {
            return errorNoEncontrado(res, "recurso");
        }

        res.status(200).json(recurso);
    } catch (error) {
        console.error(error);
        errorRespuesta(res, {
            code: "INTERNO",
            status: 500,
            message: "ID no válido o error de servidor"
        });
    }
};

// PATCH /recursos/{id}/estado
const modificarRecurso = async (req, res) => {
    try {
        const { id } = req.params;

        const esValido = validarPatchRecurso(req.body);
        if (!esValido) {
            return errorValidacion(res, validarPatchRecurso.errors);
        }

        const recurso = await Recurso.findOne({ id });
        if (!recurso) {
            return errorNoEncontrado(res, "recurso");
        }

        const update = {};
        if ("estado" in req.body) {
            // atajo PATCH /recursos/{id}/estado → estado_acople (manga) o estado_radar (radar)
            if (recurso.tipo === "manga") {
                update["manga.estado_acople"] = req.body.estado;
            } else {
                update["radar.estado_radar"] = req.body.estado;
            }
        } else {
            // update parcial genérico del submódulo (manga|radar) u otros campos
            Object.assign(update, req.body);
        }

        const recursoActualizado = await Recurso.findOneAndUpdate(
            { id },
            { $set: update },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            mensaje: "Recurso actualizado exitosamente",
            datos: recursoActualizado
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
    crearRecurso,
    obtenerRecursos,
    obtenerRecursoPorId,
    modificarRecurso
};