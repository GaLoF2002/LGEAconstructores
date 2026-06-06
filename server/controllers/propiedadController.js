import Propiedad from '../models/Propiedad.js';
import VisitaCliente from "../models/VisitaCliente.js";
import Notificacion from "../models/Notificacion.js";
import { cache, PROP_PREFIX, flushPropiedades } from "../utils/cache.js";
// Crear una propiedad
export const crearPropiedad = async (req, res) => {
    try {
        // Verificar roles permitidos
        if (req.user.role !== 'admin' && req.user.role !== 'vendedor') {
            return res.status(403).json({ msg: 'No tienes permisos para crear propiedades' });
        }

        // Extraer las rutas de las imágenes subidas
        const imagenes = req.files ? req.files.map(file => file.path) : [];

        const nuevaPropiedad = new Propiedad({
            ...req.body,
            imagenes,
            creadoPor: req.user._id
        });

        await nuevaPropiedad.save();
        flushPropiedades(); // invalida el listado/detalle cacheado
        res.status(201).json({ msg: 'Propiedad creada correctamente', propiedad: nuevaPropiedad });
    } catch (error) {
        console.error("Error al crear propiedad:", error);
        res.status(500).json({ error: 'Error al crear propiedad' });
    }
    console.log('FILES ==> ', req.files);
    console.log('BODY  ==> ', req.body);
};

export const obtenerPropiedades = async (req, res) => {
    try {
        const filtros = {};

        const num = (v) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
        };

        const metrosMin = num(req.query.metrosMin);
        const metrosMax = num(req.query.metrosMax);
        if (metrosMin !== undefined) filtros.metrosCuadrados = { $gte: metrosMin };
        if (metrosMax !== undefined) {
            filtros.metrosCuadrados = { ...filtros.metrosCuadrados, $lte: metrosMax };
        }

        const habitaciones = num(req.query.habitaciones);
        if (habitaciones !== undefined) filtros.habitaciones = habitaciones;

        const parqueaderos = num(req.query.parqueaderos);
        if (parqueaderos !== undefined) filtros.parqueaderos = parqueaderos;

        if (typeof req.query.tipo === "string" &&
            ["casa", "departamento", "terreno"].includes(req.query.tipo)) {
            filtros.tipo = req.query.tipo;
        }

        // Paginación
        const page = Math.max(1, num(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        // Caché: el listado público se repite mucho y cambia poco. Clave = filtros + página.
        const cacheKey = `${PROP_PREFIX}list:${JSON.stringify({ filtros, page, limit })}`;
        const cached = cache.get(cacheKey);
        res.set('Cache-Control', 'public, max-age=30');
        if (cached) {
            return res.json(cached);
        }

        const [data, total] = await Promise.all([
            Propiedad.find(filtros)
                .populate("creadoPor", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Propiedad.countDocuments(filtros)
        ]);

        const payload = {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1
        };
        cache.set(cacheKey, payload);
        res.json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener propiedades' });
    }
};

// Obtener una sola propiedad por ID
export const obtenerPropiedadPorId = async (req, res) => {
    try {
        const cacheKey = `${PROP_PREFIX}id:${req.params.id}`;
        const cached = cache.get(cacheKey);
        res.set('Cache-Control', 'public, max-age=30');
        if (cached) {
            return res.json(cached);
        }

        const propiedad = await Propiedad.findById(req.params.id).populate("creadoPor", "name email");
        if (!propiedad) return res.status(404).json({ msg: 'Propiedad no encontrada' });

        cache.set(cacheKey, propiedad);
        res.json(propiedad);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar la propiedad' });
    }
};

// Actualizar una propiedad
export const actualizarPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findById(req.params.id);
        if (!propiedad) {
            return res.status(404).json({ msg: 'Propiedad no encontrada' });
        }
        const estadoAnterior = propiedad.estado;

        if (req.user.role !== 'admin' && !propiedad.creadoPor.equals(req.user._id)) {
            return res.status(403).json({ msg: 'No autorizado para actualizar esta propiedad' });
        }

        // Extraer imágenes si llegan nuevas
        const nuevasImagenes = req.files ? req.files.map(file => file.path) : [];

        // Actualizar campos manualmente
        propiedad.titulo = req.body.titulo || propiedad.titulo;
        propiedad.descripcion = req.body.descripcion || propiedad.descripcion;
        propiedad.precio = req.body.precio || propiedad.precio;
        propiedad.ubicacion = req.body.ubicacion || propiedad.ubicacion;
        propiedad.metrosCuadrados = req.body.metrosCuadrados || propiedad.metrosCuadrados;
        propiedad.parqueaderos = req.body.parqueaderos || propiedad.parqueaderos;
        propiedad.habitaciones = req.body.habitaciones || propiedad.habitaciones;
        propiedad.banos = req.body.banos || propiedad.banos;
        propiedad.tipo = req.body.tipo || propiedad.tipo;
        propiedad.estado = req.body.estado || propiedad.estado;
        propiedad.caracteristicas = req.body.caracteristicas ? Array.isArray(req.body.caracteristicas) ? req.body.caracteristicas : [req.body.caracteristicas] : propiedad.caracteristicas;

        // Solo si llegan imágenes nuevas las reemplazo
        if (nuevasImagenes.length > 0) {
            propiedad.imagenes = nuevasImagenes;
        }

        await propiedad.save();
        flushPropiedades(); // invalida el listado/detalle cacheado
        if (req.body.estado && req.body.estado !== estadoAnterior) {
            const clientes = await VisitaCliente.find({ propiedad: propiedad._id }).distinct("cliente");

            await Promise.all(clientes.map(clienteId =>
                Notificacion.create({
                    usuario: clienteId,
                    mensaje: `La propiedad "${propiedad.titulo}" que visitaste ha cambiado su estado a "${req.body.estado}".`,
                    tipo: "estado-propiedad"
                })
            ));
        }

        res.json({ msg: 'Propiedad actualizada correctamente', propiedad });

    } catch (error) {
        console.error("Error al actualizar propiedad:", error);
        res.status(500).json({ error: 'Error al actualizar la propiedad' });
    }
};

// Eliminar una propiedad
export const eliminarPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findById(req.params.id);
        if (!propiedad) return res.status(404).json({ msg: 'Propiedad no encontrada' });

        if (req.user.role !== 'admin' && !propiedad.creadoPor.equals(req.user._id)) {
            return res.status(403).json({ msg: 'No autorizado para eliminar esta propiedad' });
        }

        await propiedad.deleteOne();
        flushPropiedades(); // invalida el listado/detalle cacheado
        res.json({ msg: 'Propiedad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar propiedad' });
    }
};

