import { assertEnv } from './verificaEnv.js';
assertEnv();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import propiedadRoutes from './routes/propiedadRoutes.js';
import agendamientoRoutes from './routes/agendamientoRoutes.js';
import evaluacionRoutes from "./routes/evaluacionRoutes.js";
import visitaRoutes from "./routes/visitaRoutes.js";
import indicadoresRoutes from "./routes/indicadoresRoutes.js";
import notificacionesRoutes from './routes/notificacionesRoutes.js';
import estadisticasCitasRoutes from './routes/estadisticasCitasRoutes.js';
import interesRoutes from "./routes/interesRoutes.js";
import reporteRoutes from "./routes/reporteRoutes.js";
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { globalLimiter } from './middlewares/rateLimiters.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();

// Detrás de Nginx/Hostinger: req.ip real.
app.set('trust proxy', 1);

// Logger HTTP estructurado.
app.use(pinoHttp({
    autoLogging: { ignore: (req) => req.url === '/api/health' },
    serializers: {
        req: (req) => ({ method: req.method, url: req.url, id: req.id }),
        res: (res) => ({ statusCode: res.statusCode })
    },
    redact: ['req.headers.authorization', 'req.headers.cookie']
}));

// Headers de seguridad. crossOriginResourcePolicy relajado porque las imágenes vienen de Cloudinary.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS con whitelist explícita.
const allowedOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Origen no permitido por CORS'));
    },
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Sanitiza claves que empiecen con $ o contengan . para mitigar NoSQL injection.
app.use(mongoSanitize({ replaceWith: '_' }));

// Healthcheck (sin auth, ignorado en logs).
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 1 = connected
    const ok = dbState === 1;
    res.status(ok ? 200 : 503).json({
        status: ok ? 'ok' : 'degraded',
        db: ok ? 'ok' : 'down',
        uptime: process.uptime()
    });
});

// Límite global (después del healthcheck para no limitarlo).
app.use(globalLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/propiedades', propiedadRoutes);
app.use('/api/agendamiento', agendamientoRoutes);
app.use('/api/evaluacion', evaluacionRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/estadisticas-citas', estadisticasCitasRoutes);
app.use('/api/interes', interesRoutes);
app.use('/api/reportes', reporteRoutes);

// En producción, el mismo servicio sirve el build de React (mismo dominio → cookie funciona).
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientDist));

    // Fallback SPA: cualquier GET que no sea /api ni un archivo estático → index.html.
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(clientDist, 'index.html'));
        }
        next();
    });
}

// 404 + error handler al final.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Cierre limpio.
const shutdown = async (signal) => {
    console.log(`\n${signal} recibido, cerrando...`);
    server.close(() => console.log('HTTP server cerrado.'));
    try {
        await mongoose.disconnect();
        console.log('Mongo desconectado.');
    } catch (e) {
        console.error('Error cerrando Mongo:', e);
    }
    process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
