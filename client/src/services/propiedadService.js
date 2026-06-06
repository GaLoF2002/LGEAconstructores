import api from "./axiosInstance";

// Desempaca la respuesta paginada para mantener res.data como array.
// La metadata de paginación queda en res.meta = { total, page, totalPages }.
export const getPropiedades = async (filtros = {}) => {
    const res = await api.get("/propiedades", { params: filtros });
    const body = res.data;
    if (body && Array.isArray(body.data)) {
        return {
            ...res,
            data: body.data,
            meta: { total: body.total, page: body.page, totalPages: body.totalPages }
        };
    }
    return res;
};

export const getPropiedadPorId = (id) => api.get(`/propiedades/${id}`);

export const crearPropiedad = (formData) =>
    api.post("/propiedades", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const actualizarPropiedad = (id, data) =>
    api.put(`/propiedades/${id}`, data);

export const eliminarPropiedad = (id) => api.delete(`/propiedades/${id}`);
