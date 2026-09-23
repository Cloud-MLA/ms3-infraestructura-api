// Cliente HTTP para MS2 (vuelos/aeronaves) usando el fetch nativo de Node 20.
// Endpoints consumidos (contrato MS2, base /api/vuelos):
//   GET /api/vuelos/{id}/exists        -> { exists, estado }
//   GET /api/vuelos/{id}               -> { ..., aeronavePlaca }
//   GET /api/vuelos/aeronaves/{placa}  -> { ..., clase }
//
// Errores hacia MS3 según docs/contratos/errores.md:
//   MS2 caído o 5xx  -> DEPENDENCIA_ERROR   (502)
//   MS2 sin respuesta en TIMEOUT_MS -> DEPENDENCIA_TIMEOUT (503)

const MS2_URL = (process.env.MS2_URL || "http://localhost:8002").replace(/\/+$/, "");
const TIMEOUT_MS = Number(process.env.MS2_TIMEOUT_MS || 3000);

class MS2DependenciaError extends Error {
    constructor({ code, status, message, userMessage }) {
        super(message);
        this.name = "MS2DependenciaError";
        this.code = code;
        this.status = status;
        this.userMessage = userMessage;
    }
}

async function _get(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const url = `${MS2_URL}${path}`;
    console.log(`[MS3->MS2] GET ${url}`);

    let resp;
    try {
        resp = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" }
        });
    } catch (err) {
        const esTimeout = err.name === "AbortError" || err.code === "ABORT_ERR";
        throw new MS2DependenciaError({
            code: esTimeout ? "DEPENDENCIA_TIMEOUT" : "DEPENDENCIA_ERROR",
            status: esTimeout ? 503 : 502,
            message: err.message,
            userMessage: esTimeout
                ? "MS2 no respondió a tiempo al validar el vuelo."
                : "No se pudo contactar a MS2 para validar el vuelo."
        });
    } finally {
        clearTimeout(timer);
    }

    if (!resp.ok) {
        throw new MS2DependenciaError({
            code: "DEPENDENCIA_ERROR",
            status: 502,
            message: `MS2 respondió ${resp.status} en ${path}`,
            userMessage: "MS2 respondió con error al validar el vuelo."
        });
    }
    return resp.json();
}

// Devuelve { exists: boolean, estado: string|null }
async function verificarVuelo(vueloId) {
    const data = await _get(`/api/vuelos/${vueloId}/exists`);
    return { exists: Boolean(data.exists), estado: data.estado || null };
}

// Devuelve la clase OACI (A..F) de la aeronave que opera el vuelo.
async function obtenerClaseAeronave(vueloId) {
    const vuelo = await _get(`/api/vuelos/${vueloId}`);
    if (!vuelo || !vuelo.aeronavePlaca) {
        throw new MS2DependenciaError({
            code: "DEPENDENCIA_ERROR",
            status: 502,
            message: `MS2 no devolvió aeronavePlaca para el vuelo ${vueloId}`,
            userMessage: "MS2 no devolvió el avión asignado al vuelo."
        });
    }
    const aeronave = await _get(`/api/vuelos/aeronaves/${encodeURIComponent(vuelo.aeronavePlaca)}`);
    if (!aeronave || !aeronave.clase) {
        throw new MS2DependenciaError({
            code: "DEPENDENCIA_ERROR",
            status: 502,
            message: `MS2 no devolvió clase para ${vuelo.aeronavePlaca}`,
            userMessage: "MS2 no devolvió la clase de la aeronave."
        });
    }
    return aeronave.clase;
}

module.exports = {
    MS2_URL,
    MS2DependenciaError,
    verificarVuelo,
    obtenerClaseAeronave
};