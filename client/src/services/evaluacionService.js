import api from "./axiosInstance";

export const crearEvaluacion = (formData) =>
    api.post("/evaluacion/evaluacion-compra", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const getEvaluacionesPorPropiedad = (propiedadId) =>
    api.get(`/evaluacion/evaluacion-compra/por-propiedad/${propiedadId}`);

export const simularFinanciamiento = ({ propiedadId, porcentajeEntrada, plazoAnios }) =>
    api.post("/evaluacion/simular-financiamiento", {
        propiedadId,
        porcentajeEntrada,
        plazoAnios
    });

export const getEvaluacionPorId = (evaluacionId) =>
    api.get(`/evaluacion/evaluacion-detalle/${evaluacionId}`);

// Pide una URL firmada (5 min) para descargar el PDF privado en la posición `index`.
export const getUrlDocumento = (evaluacionId, index) =>
    api.get(`/evaluacion/${evaluacionId}/documento/${index}`);
