import express from 'express';
import {
    marcarCitaEjecutada,
    obtenerResumenMensualPorVendedor,
    obtenerResumenMensualParaAdmin,
    obtenerCitasDelMes
} from '../controllers/estadisticasCitasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/cita/:citaId/ejecutar', authMiddleware, marcarCitaEjecutada);
router.get('/vendedor/resumen', authMiddleware, obtenerResumenMensualPorVendedor);
router.get('/admin/resumen-citas', authMiddleware, obtenerResumenMensualParaAdmin);
router.get('/citas-mes', authMiddleware, obtenerCitasDelMes); // ✅ NUEVA RUTA

export default router;
