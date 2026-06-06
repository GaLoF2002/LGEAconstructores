import api from "./axiosInstance";

export const registrarVisita = (propiedadId) =>
    api.post(`/visitas/registrar/${propiedadId}`);

export const registrarDuracionVisualizacion = (propiedadId, duracionSegundos) =>
    api.post("/visitas/registrar-duracion", { propiedadId, duracionSegundos });
