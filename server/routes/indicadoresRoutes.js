// routes/indicadoresRoutes.js
import express from "express";
import { obtenerIndicadores, obtenerEstadisticasPorPropiedad } from "../controllers/indicadoresController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Indicadores de gestión: solo admin y vendedor (no clientes).
router.get("/", authMiddleware, requireRole("admin", "vendedor"), obtenerIndicadores);

// Obtener estadísticas por propiedad
router.get("/propiedadIndicador/:propiedadId", authMiddleware, requireRole("admin", "vendedor"), obtenerEstadisticasPorPropiedad);

export default router;
