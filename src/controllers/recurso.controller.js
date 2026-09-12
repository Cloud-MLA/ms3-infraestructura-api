const Recurso  = require('../models/recurso.model');
const { validarRecurso, validarPatchRecurso } = require('../schemas/recurso.schema');

//post
const crearRecurso = async (req, res) => {
    try{
        const esValido = validarRecurso(req.body);
        if (!esValido) {
            return res.status(400).json({
                mensaje: "Datos inválidos. Revisa los enums permitidos",
                errores: validarRecurso.errors
            });
        }

        const nuevoRecurso = new Recurso(req.body);
        await nuevoRecurso.save();

        res.status(201).json({
            mensaje: "recurso creado con éxito",
            datos: nuevoRecurso
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ 
            mensaje: "Error interno del servidor",
            errores: error.message
        });
    }
};

//get general y con parametros opcionales :v
const obtenerRecursos = async (req, res) => {
    try{
        const filtros = req.query;
        const recursos = await Recurso.find(filtros);

        res.status(200).json(recursos);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener recursos", 
            error: error.message 
        });
    }
};

//get por id
const obtenerRecursoPorId = async (req, res) => {
    try {
        //agarrar el id, buscarlo con el find y devolver el json 
        const { id } = req.params;
        const recurso = await Recurso.findById(id);

        if (!recurso) {
            return res.status(404).json({ 
                mensaje: "Recurso no encontrado"
            });
        }

        res.status(200).json(recurso);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "ID no válido o error de servidor", 
            error: error.message 
        });
    }
};

//patch recursos
const modificarRecurso = async (req, res) => {
    try {
        const { id } = req.params;

        const esValido = validarPatchRecurso(req.body);
        if (!esValido){
            return res.status(400).json({
                mensaje: "Datos inválidos",
                errores: validarPatchRecurso.errors
            });
        }

        const recurso = await Recurso.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true });

        if (!recurso){
            return res.status(404).json({ 
                mensaje: "Recurso no encontrado" 
            });
        }

        res.status(200).json({
            mensaje: "Recurso actualizado exitosamente",
            datos: recurso
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ 
            mensaje: "Error interno del servidor", 
            errores: error.message 
        });
    }
};

module.exports = {
    crearRecurso,
    obtenerRecursos,
    obtenerRecursoPorId,
    modificarRecurso
};