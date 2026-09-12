const Asignacion =require('../models/asignacion.model');
const { validarAsignacion } = require('../schemas/asignacion.schema');
const Recurso = require('../models/recurso.model');

const crearAsignaciones = async (req, res) => {
    try {
        const esValido = validarAsignacion(req.body);
        if (!esValido) {
            return res.status(400).json({
                mensaje: "Datos inválidos",
                errores: validarAsignacion.errors
            });
        }

        const recursoExiste = await Recurso.findOne({ id: req.body.recurso_id });
        if (!recursoExiste){
            return res.status(404).json({
                mensaje: "El recurso_id dado no existe"
            });
        }

        const nuevaAsignacion = new Asignacion(req.body);
        await nuevaAsignacion.save();

        res.status(201).json({
            mensaje: "asignacion creada con éxito",
            datos: nuevaAsignacion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Fallo del servidor",
            errores: error.message
        });
    }
};

const obtenerAsignaciones = async (req, res) => {
    try {
        const filtros = req.query;
        const asignaciones = await Asignacion.find(filtros);

        res.status(200).json(asignaciones);
    } catch (error) {
        res.status(500).json({
            mensaje: "Eror al obtener asignaciones",
            errores: error.message
        });
    }
};

module.exports = {
    crearAsignaciones,
    obtenerAsignaciones
}
