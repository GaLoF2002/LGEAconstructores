import api from "./axiosInstance";

export const register = (userData) => api.post("/auth/register", userData);

export const login = (userData) => api.post("/auth/login", userData);

export const enviarEmailRecuperacion = (email) =>
    api.post("/auth/forgot-password", { email });

export const resetearContrasena = (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password });

export const logout = () => api.post("/auth/logout");
