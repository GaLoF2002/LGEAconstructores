import express from 'express';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.js';
import { reporteSemanal } from '../controllers/reporteController.js';

const router = express.Router();

// Consumido por n8n (Cron semanal). Auth por API key de servicio, no por cookie JWT.
router.get('/semanal', apiKeyAuth, reporteSemanal);

export default router;
