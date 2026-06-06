import api from "./axiosInstance";

export const obtenerPerfilCliente = () => api.get("/user/profile");

export const actualizarPerfil = (data) => api.post("/user/profile", data);
