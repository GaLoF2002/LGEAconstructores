import express from "express";
import { obtenerPerfil, actualizarPerfil } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/profileValidators.js";

const router = express.Router();

// Ruta para obtener el perfil
router.get("/profile", authMiddleware, obtenerPerfil);

// Ruta para actualizar el perfil
router.post("/profile", authMiddleware, validate(updateProfileSchema), actualizarPerfil);

export default router;
