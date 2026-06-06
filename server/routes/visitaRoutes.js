import express from "express";
import { registrarVisita, registrarDuracionVisualizacion} from "../controllers/visitaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/registrar/:propiedadId", authMiddleware, registrarVisita);

router.post("/registrar-duracion", authMiddleware, registrarDuracionVisualizacion);

export default router;
