import express from "express";
import {
    obtenerNotificaciones,
    marcarComoLeida,
    eliminarNotificacion,
    marcarTodasComoLeidas
} from "../controllers/notificacionController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";


const router = express.Router();

// 🔒 Todas requieren autenticación
router.get("/", authMiddleware, obtenerNotificaciones);
router.patch("/leer/:id", authMiddleware, marcarComoLeida);
router.delete("/:id", authMiddleware, eliminarNotificacion);
router.patch("/leer-todas", authMiddleware, marcarTodasComoLeidas);

export default router;
