const Incidencia = require('../models/incidencia.model');
const { validarIncidencia, validarPatchIncidencia } = require('../schemas/incidencia.schema');

//post 
const crearIncidencia = async (req, res) => {
    try {
        const esValido = validarIncidencia(req.body);

        if (!esValido) {
            return res.status(400).json({
                mensaje: "Datos inválidos, revisa los enums",
                errores: validarIncidencia.errors
            });
        }

        const nuevaIncidencia = new Incidencia(req.body);
        await nuevaIncidencia.save();

        res.status(201).json({
            mensaje: "incidencia creada con éxito?",
            datos: nuevaIncidencia
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            mensaje: "error interno del servidor",
            error: error.message
        });
    }
};

//get general 
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
        res.status(500).json({
            mensaje: "error al obtener incidencias",
            error: error.message
        });
    }
};

const obtenerIncidenciasPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(id);

        if (!incidencia) {
            return res.status(404).json({
                mensaje: "Incidencia no encontrada"
            });
        }

        res.status(200).json(incidencia);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "ID no válido",
            error: error.message
        });
    } 
}

//patch 
const modificarIncidencia = async (req, res) => {
    try {
        const { id } = req.params;
        const esValido = validarPatchIncidencia(req.body);

        if (!esValido) {
            return res.status(400).json({
                mensaje: "Datos inválidos",
                errores: validarPatchIncidencia.errors
            });
        }
        const incidencia = await Incidencia.findByIdAndUpdate(
            id,
            req.body,
            {new: true, runValidators: true}
        );

        if (!incidencia){
            return res.status(404).json({
                mensaje: "Incidencia no encontrada"
            });
        }
        res.status(200).json({
            mensaje: "Incidencia actualizada exitosamente",
            datos: incidencia
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Fallo interno del servidor",
            error: error.message
        });
    }
};

module.exports = {
    crearIncidencia,
    obtenerIncidencias,
    obtenerIncidenciasPorId,
    modificarIncidencia
};