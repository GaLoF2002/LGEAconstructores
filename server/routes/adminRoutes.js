import express from 'express';
import {
    crearVendedor,
    obtenerVendedores,
    actualizarVendedor,
    eliminarVendedor
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-seller', authMiddleware, adminMiddleware, crearVendedor);
router.get('/sellers', authMiddleware, adminMiddleware, obtenerVendedores);
router.put('/update-sellers/:id', authMiddleware, adminMiddleware, actualizarVendedor);
router.delete('/delete-sellers/:id', authMiddleware, adminMiddleware, eliminarVendedor); // Nueva ruta para eliminar vendedores


export default router;
