import api from "./axiosInstance";

export const getIndicadores = () => api.get("/indicadores");

export const getIndicadoresPorPropiedad = (propiedadId) =>
    api.get(`/indicadores/propiedadIndicador/${propiedadId}`);
