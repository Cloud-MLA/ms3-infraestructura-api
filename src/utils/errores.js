// Formato único de error (docs/contratos/errores.md — BE-TX-08):
// { error: { code, message, status, details, service, timestamp, request_id } }
const SERVICE = "ms3-infraestructura-api";

function errorRespuesta(res, { code, status, message, details = [] }) {
    return res.status(status).json({
        error: {
            code,
            message,
            status,
            details,
            service: SERVICE,
            timestamp: new Date().toISOString()
        }
    });
}

// Errores con catálogo conocido (ver docs/contratos/errores.md §3)
const errorValidacion = (res, detallesAjv = []) =>
    errorRespuesta(res, {
        code: "VALIDACION",
        status: 400,
        message: "Datos inválidos. Revisa los enums permitidos y los campos requeridos.",
        details: detallesAjv
    });

const errorNoEncontrado = (res, recurso = "recurso") =>
    errorRespuesta(res, {
        code: "NO_ENCONTRADO",
        status: 404,
        message: `${recurso} no encontrado`
    });

const errorVueloNoExiste = (res, vueloId) =>
    errorRespuesta(res, {
        code: "VUELO_NO_EXISTE",
        status: 422,
        message: `El vuelo ${vueloId} no existe o está cancelado.`,
        details: [{ field: "vuelo_id", issue: `vuelo ${vueloId} no existe o está cancelado en MS2` }]
    });

const errorAcopleClase = (res, claseAeronave, claseMax) =>
    errorRespuesta(res, {
        code: "ACOPLE_CLASE_INVALIDO",
        status: 422,
        message: `La aeronave de clase ${claseAeronave} no puede acoplarse a una manga de clase ${claseMax}.`,
        details: [{ field: "recurso_id", issue: `clase aeronave ${claseAeronave} > clase_max manga ${claseMax}` }]
    });

const errorRecursoOcupado = (res, recursoId) =>
    errorRespuesta(res, {
        code: "RECURSO_OCUPADO",
        status: 409,
        message: `El recurso ${recursoId} no está Libre y no puede asignarse.`,
        details: [{ field: "recurso_id", issue: `recurso ${recursoId} no está en estado Libre` }]
    });

const errorIncidenciaYaCerrada = (res, incidenciaId) =>
    errorRespuesta(res, {
        code: "INCIDENCIA_YA_CERRADA",
        status: 409,
        message: `La incidencia ${incidenciaId} ya está cerrada.`,
        details: [{ field: "id", issue: `fecha_cierre ya asignada en incidencia ${incidenciaId}` }]
    });

const errorDependencia = (res, err) =>
    errorRespuesta(res, {
        code: err.code || "DEPENDENCIA_ERROR",
        status: err.status || 502,
        message: err.userMessage || "El servicio dependiente MS2 falló al validar la petición.",
        details: [{ field: "ms2", issue: err.message || "respuesta de error de MS2" }]
    });

module.exports = {
    errorRespuesta,
    errorValidacion,
    errorNoEncontrado,
    errorVueloNoExiste,
    errorAcopleClase,
    errorRecursoOcupado,
    errorIncidenciaYaCerrada,
    errorDependencia
};