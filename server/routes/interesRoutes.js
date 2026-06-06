// routes/interesRoutes.js
import express from "express";
import {desmarcarInteres, marcarInteres, obtenerInteresesPorCliente} from "../controllers/interesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { marcarInteresSchema } from "../validators/interesValidators.js";

const router = express.Router();

router.post("/marcar-interes", authMiddleware, validate(marcarInteresSchema), marcarInteres);
router.get("/mis-intereses", authMiddleware, obtenerInteresesPorCliente);
router.delete("/interes/:propiedadId", authMiddleware, desmarcarInteres);

export default router;
