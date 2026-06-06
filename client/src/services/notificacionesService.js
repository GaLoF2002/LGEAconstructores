import api from "./axiosInstance";

export const getNotificaciones = () => api.get("/notificaciones");

export const marcarNotificacionComoLeida = (id) =>
    api.patch(`/notificaciones/leer/${id}`);

export const marcarTodasComoLeidas = () =>
    api.patch("/notificaciones/leer-todas");

export const eliminarNotificacion = (id) =>
    api.delete(`/notificaciones/${id}`);
