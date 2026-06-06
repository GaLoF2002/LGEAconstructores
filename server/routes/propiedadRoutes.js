// ✅ routes/propiedadRoutes.js
import express from 'express';
import upload, { multerErrors } from "../config/uploadConfig.js";
import {
    crearPropiedad,
    obtenerPropiedades,
    obtenerPropiedadPorId,
    actualizarPropiedad,
    eliminarPropiedad
} from '../controllers/propiedadController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { crearPropiedadSchema, actualizarPropiedadSchema } from '../validators/propiedadValidators.js';

const router = express.Router();

// Todas requieren autenticación
router.post(
    '/',
    authMiddleware,
    upload.array("imagenes", 10),
    multerErrors,
    validate(crearPropiedadSchema),   // valida el body ya parseado por multer
    crearPropiedad
); // Crear propiedad
router.get('/', obtenerPropiedades);             // Ver todas las propiedades (clientes pueden ver)
router.get('/:id', obtenerPropiedadPorId);       // Ver detalle por ID
router.put('/:id', authMiddleware, validate(actualizarPropiedadSchema), actualizarPropiedad); // Editar propiedad
router.delete('/:id', authMiddleware, eliminarPropiedad); // Eliminar propiedad

export default router;
