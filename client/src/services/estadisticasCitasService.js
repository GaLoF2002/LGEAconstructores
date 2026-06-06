import api from "./axiosInstance";

export const obtenerCitasDelMes = () =>
    api.get("/estadisticas-citas/citas-mes");

export const marcarCitaComoEjecutada = (id) =>
    api.put(`/estadisticas-citas/cita/${id}/ejecutar`);

export const obtenerResumenMensualPorVendedor = () =>
    api.get("/estadisticas-citas/vendedor/resumen");

export const obtenerResumenMensualParaAdmin = () =>
    api.get("/estadisticas-citas/admin/resumen-citas");
