import User from '../models/User.js';
import bcrypt from 'bcryptjs';


export const crearVendedor = async (req, res) => {
        const { name, email, password, phone, codigoVendedor, inmobiliaria, genero } = req.body;

        try {
                const userExists = await User.findOne({ email });
                if (userExists) {
                        return res.status(400).json({ error: "El usuario ya existe" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const seller = new User({
                        name,
                        email,
                        password: hashedPassword,
                        phone,
                        role: "vendedor",
                        codigoVendedor,
                        inmobiliaria,
                        genero
                });

                await seller.save();
                res.status(201).json({ message: "Vendedor creado correctamente" });
        } catch (error) {
                res.status(500).json({ error: "Error al crear el vendedor" });
        }
};


// Escapa metacaracteres regex (mitiga ReDoS / inyección regex).
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const obtenerVendedores = async (req, res) => {
        const { search = "", sort = "asc" } = req.query;

        try {
                const safeSearch = escapeRegex(String(search).slice(0, 80));
                const query = {
                        role: "vendedor",
                        name: { $regex: safeSearch, $options: "i" }
                };

                const sortOption = sort === "desc" ? -1 : 1;

                // Paginación
                const num = (v) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? n : undefined;
                };
                const page = Math.max(1, num(req.query.page) || 1);
                const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));
                const skip = (page - 1) * limit;

                const [data, total] = await Promise.all([
                        User.find(query)
                            .select("-password")
                            .sort({ name: sortOption })
                            .skip(skip)
                            .limit(limit),
                        User.countDocuments(query)
                ]);

                res.json({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
        } catch (error) {
                res.status(500).json({ error: "Error al obtener los vendedores" });
        }
};

export const actualizarVendedor = async (req, res) => {
        const { id } = req.params;
        const { name, email, phone, password } = req.body;

        try {
                const seller = await User.findById(id);
                if (!seller) {
                        return res.status(404).json({ error: "Vendedor no encontrado" });
                }

                // Actualizar solo los campos enviados
                seller.name = name || seller.name;
                seller.email = email || seller.email;
                seller.phone = phone || seller.phone;

                // Si se envía una nueva contraseña, se hashea antes de guardarla
                if (password) {
                        seller.password = await bcrypt.hash(password, 10);
                }

                await seller.save();
                res.json({ message: "Vendedor actualizado correctamente" });
        } catch (error) {
                res.status(500).json({ error: "Error al actualizar el vendedor" });
        }
};

export const eliminarVendedor = async (req, res) => {
        const { id } = req.params;
        try {
                const seller = await User.findById(id);
                if (!seller) {
                        return res.status(404).json({ error: "Vendedor no encontrado" });
                }

                await seller.deleteOne();
                res.json({ message: "Vendedor eliminado correctamente" });
        } catch (error) {
                res.status(500).json({ error: "Error al eliminar el vendedor" });
        }
};




