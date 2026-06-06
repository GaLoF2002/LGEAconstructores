import api from "./axiosInstance";

// ========== DISPONIBILIDAD ========== //

export const crearDisponibilidad = (disponibilidadData) =>
    api.post("/agendamiento/disponibilidad", disponibilidadData);

export const getDisponibilidadPorVendedor = (vendedorId) =>
    api.get(`/agendamiento/disponibilidad/${vendedorId}`);

// ========== CITAS ========== //

export const crearCita = (citaData) => api.post("/agendamiento/citas", citaData);

export const getMisCitas = () => api.get("/agendamiento/citas");

export const cambiarEstadoCita = (citaId, nuevoEstado) =>
    api.put(`/agendamiento/citas/${citaId}/estado`, { estado: nuevoEstado });

export const reagendarCita = (citaId, nuevaFecha, nuevaHora) =>
    api.put(`/agendamiento/citas/${citaId}/reagendar`, { nuevaFecha, nuevaHora });

export const eliminarCita = (citaId) =>
    api.delete(`/agendamiento/citas/${citaId}`);
