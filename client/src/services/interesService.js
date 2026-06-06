import api from "./axiosInstance";

export const marcarInteres = (propiedadId) =>
    api.post("/interes/marcar-interes", { propiedadId });

export const getMisIntereses = () => api.get("/interes/mis-intereses");

// Mantiene la firma del legacy; usa el mismo endpoint que getMisIntereses.
export const verificarInteres = () => api.get("/interes/mis-intereses");

export const desmarcarInteres = (propiedadId) =>
    api.delete(`/interes/interes/${propiedadId}`);
