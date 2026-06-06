import api from "./axiosInstance";

// Desempaca paginación: res.data queda como array, meta en res.meta.
export const getSellers = async (search = "", sort = "asc") => {
    const res = await api.get("/admin/sellers", { params: { search, sort } });
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

export const createSeller = (sellerData) =>
    api.post("/admin/create-seller", sellerData);

export const updateSeller = (id, sellerData) =>
    api.put(`/admin/update-sellers/${id}`, sellerData);

export const deleteSeller = (id) =>
    api.delete(`/admin/delete-sellers/${id}`);
