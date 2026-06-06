# Roadmap de mejora y despliegue en Hostinger

Plan dividido en 7 fases. Cada fase tiene **objetivo**, **tareas concretas**, **archivos a tocar**, y **criterio de cierre**. Las fases 1-2 son bloqueantes para producción. Las 3-4 son las que dejan el proyecto desplegable. Las 5-7 son el despliegue real y el mantenimiento.

Tiempo estimado total: **2-3 semanas** trabajando full-time, o **6-8 semanas** part-time.

---

## FASE 0 — Preparación y decisiones (½ día)

**Objetivo**: dejar claro qué tipo de hosting vas a usar y preparar el entorno.

### Decisión clave: ¿qué plan de Hostinger?
- **Shared / Business Web Hosting**: corre Node.js pero limitado (sin background workers fiables, sin acceso root, puerto restringido). **NO recomendado** para MERN.
- **VPS Hostinger (KVM 2 o superior)** — Ubuntu 22.04, 2+ GB RAM, acceso root. **Recomendado.** Permite Nginx + PM2 + cron + certbot.
- **Cloud Hosting**: solo si vas a escalar; sobra para este proyecto.

### Decisión: ¿dónde MongoDB?
- **MongoDB Atlas** (cluster M0 gratis o M10 pago). **Recomendado** — sigues con tu connection string actual.
- Mongo instalado en el VPS: posible pero te toca administrar backups, seguridad, y tira RAM.

### Tareas
- [ ] Contratar VPS Hostinger (KVM 2 mínimo: 2 vCPU, 8 GB RAM).
- [ ] Comprar / apuntar dominio (Hostinger DNS o externo).
- [ ] Crear cluster MongoDB Atlas si aún no lo tienes y whitelistear la IP del VPS.
- [ ] Crear repositorio Git remoto (GitHub / GitLab) si todavía está solo local.
- [ ] Generar claves: `JWT_SECRET` (32+ bytes random), Gmail app password, Cloudinary keys.

**Criterio de cierre**: tienes VPS + dominio + Atlas + repo + secretos generados en un gestor (1Password, Bitwarden, o `.env.production` cifrado).

---

## FASE 1 — Seguridad crítica (bloqueante, 2-3 días)

**Objetivo**: eliminar las vulnerabilidades CRÍTICAS y ALTAS identificadas en `CLAUDE.md` §5.

### Tareas

#### 1.1 Cerrar la escalada de privilegios
**Archivo**: `server/controllers/authController.js:9-22`
- Eliminar `role` de la lectura del body en `register`.
- Hardcodear `role: "cliente"` para el endpoint público.
- Cualquier creación de vendedor/admin debe pasar exclusivamente por `/api/admin/create-seller` (ya protegido) o un script CLI.

#### 1.2 Eliminar el admin auto-creado
**Archivo**: `server/server.js:31-52`
- Borrar la función `createAdminUser` completa.
- Crear un script `server/scripts/bootstrapAdmin.js` que lea email/password de env, los valide, y haga `User.create({...})` una sola vez.
- Documentar en README cómo ejecutarlo: `node scripts/bootstrapAdmin.js`.
- Si el deployment actual ya estuvo con `admin123`, **cambia esa contraseña antes de redesplegar**.

#### 1.3 Borrar logs de secretos
- `server/verificaEnv.js` → eliminar el archivo o reemplazar por un validador real (ver Fase 4).
- `server/config/emailConfig.js:15-16` → borrar los `console.log` de `GMAIL_USER` y `GMAIL_PASS`.
- `client/src/services/adminService.js:8` → borrar `console.log("Token enviado:", token)`.
- `client/src/services/agendamientoService.js:40` → borrar `console.log("🔑 Headers...")`.
- Buscar todos los `console.log(token` y `console.log(...GMAIL`/`...JWT`/`...PASS` y eliminarlos.

#### 1.4 Rate limiting
- `cd server && yarn add express-rate-limit`
- En `server.js`, después de los middlewares JSON, agregar:
  ```js
  import rateLimit from 'express-rate-limit';
  const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5, standardHeaders: true });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth/register', rateLimit({ windowMs: 60*60*1000, max: 10 }));
  ```

#### 1.5 CORS correcto
- `server/server.js:56-59` → reemplazar por:
  ```js
  const allowed = (process.env.FRONTEND_URL || '').split(',').filter(Boolean);
  if (!allowed.length) throw new Error('FRONTEND_URL is required');
  app.use(cors({
    origin: (origin, cb) => (!origin || allowed.includes(origin)) ? cb(null, true) : cb(new Error('CORS')),
    credentials: true
  }));
  ```

#### 1.6 Hashear tokens de reset
- `server/controllers/authController.js`:
  - En `forgotPassword`, hashear el token con `crypto.createHash('sha256').update(token).digest('hex')` antes de guardarlo. Enviar el token plano por email.
  - En `resetPassword`, hashear el token recibido y buscar por el hash.
  - Reducir TTL de 1 h a 15 min.
  - Quitar `save({ validateBeforeSave: false })` — usar `User.findByIdAndUpdate(user._id, {$set:{resetToken,resetTokenExpires}})`.

#### 1.7 Arreglar autorización en citas
- `server/controllers/citaController.js`:
  - `cambiarEstadoCita`: añadir check `if (String(cita.vendedor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403)...`. Validar `estado` contra `['pendiente','aceptada','cancelada']`. Mover el null check ANTES del set.
  - `eliminarCita`: idem, verificar ownership antes de borrar.

#### 1.8 Cerrar evaluaciones cruzadas
- `server/controllers/evaluacionController.js`:
  - `obtenerEvaluacionesPorPropiedad`: añadir check de que `req.user.role === 'admin'` o que `req.user._id` sea el `creadoPor` de la propiedad.
  - Idem en `obtenerEvaluacionPorId`.

**Criterio de cierre**: corres un pen-test manual y ninguno de estos vectores funciona:
- `POST /api/auth/register {role:"admin"}` → rol cliente.
- Login con `admin@example.com / admin123` → falla.
- 6 intentos seguidos a `/api/auth/login` → 429.
- Petición con `Origin: http://evil.com` → bloqueada.
- Cliente A intenta ver evaluación de cliente B → 403.

---

## FASE 2 — Seguridad frontend + arquitectura limpia (2 días)

**Objetivo**: el frontend deja de filtrar tokens, las rutas se protegen, y el código queda listo para producción.

### Tareas

#### 2.1 Centralizar Axios
**Archivo**: `client/src/services/axiosInstance.js` (actualmente vacío)
```js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default instance;
```
Después, en cada `services/*.js`:
- Reemplazar `axios.get(...)` por `instance.get(...)`.
- Eliminar `getAuthHeaders()` y el `API_URL` hardcodeado.

#### 2.2 Variables de entorno en frontend
- Crear `client/.env.development`: `VITE_API_URL=http://localhost:5000/api`
- Crear `client/.env.production`: `VITE_API_URL=https://api.tudominio.com/api`
- Ajustar todos los services para usar el path relativo (`/auth/login`, `/propiedades`, etc.) ya que `baseURL` los prefija.

#### 2.3 Rutas protegidas
**Nuevo archivo**: `client/src/components/ProtectedRoute.jsx`
```jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
```
Envolver rutas privadas en `App.jsx`:
```jsx
<Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
<Route path="/vendedor" element={<ProtectedRoute roles={['vendedor','admin']}><VendedorDashboard /></ProtectedRoute>} />
// ...
```

#### 2.4 Limpiar mensajes de error reflejados
- Buscar `alert(error.response?.data?.error)` y `alert("Error: " + error.message)` y reemplazar con mensajes genéricos por contexto: `"No pudimos completar el registro. Intenta de nuevo."`.
- Mantener detalles solo en `console.error` para depuración local.

#### 2.5 Reemplazar `alert()` por sistema de toast
- Reutilizar el patrón `.notification` de `Login.jsx` o agregar una librería ligera (`react-hot-toast` ≈ 5 KB). Recomendado: usar el patrón ya existente para no agregar dependencias.

#### 2.6 Eliminar código muerto
- `server/services/verificarCitasProximas.js` (vacío) → eliminar o implementar (ver Fase 3).
- `server/config/multer.js` vs `server/config/uploadConfig.js` → consolidar en uno. Quedarse con `uploadConfig.js` que exporta `default` (imágenes) + `uploadEvaluaciones` (PDFs). Borrar `multer.js`. Ajustar imports en `routes/evaluacionRoutes.js`.

**Criterio de cierre**:
- Borrar `localStorage` en el navegador y entrar a `/admin` redirige a `/login`.
- Token vencido provoca redirect automático a `/login`.
- `grep -r "localhost:5000" client/src` no devuelve nada.

---

## FASE 3 — Robustez (3-4 días)

**Objetivo**: el proyecto deja de romperse con inputs malformados y empieza a comportarse como software de producción.

### Tareas

#### 3.1 Validación de entrada
- `cd server && yarn add zod`
- Crear `server/validators/` con un schema por endpoint sensible: `authValidators.js`, `propiedadValidators.js`, etc.
- Middleware genérico:
  ```js
  export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    req.body = result.data;
    next();
  };
  ```
- Aplicar en todas las rutas POST/PUT.

#### 3.2 Sanitización Mongo
- `yarn add express-mongo-sanitize`
- En `server.js`: `app.use(mongoSanitize())` antes de las rutas. Esto cierra el resto de vectores NoSQL injection.

#### 3.3 Helmet
- `yarn add helmet`
- En `server.js`: `app.use(helmet())` antes de CORS.

#### 3.4 Error middleware central
- Crear `server/middlewares/errorHandler.js`:
  ```js
  export const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Error interno' : err.message });
  };
  ```
- En `server.js`, al final de los routers: `app.use(errorHandler)`.
- En cada controller, reemplazar `try/catch` con `res.status(500).json(...)` por throw o por `next(error)`.

#### 3.5 Logger estructurado
- `yarn add pino pino-http`
- Sustituir `console.log` por `req.log.info(...)` y `pino` en arranque.
- En producción, configurar redirección a archivo + rotación (`pino-roll`).

#### 3.6 Paginación
- `GET /api/propiedades` y `GET /api/admin/sellers`:
  - Aceptar `?page=1&limit=20`.
  - Devolver `{ data: [...], total, page, totalPages }`.
- Actualizar `propiedadService.js` y `adminService.js` y los componentes que los consumen.

#### 3.7 Endpoint de logout server-side (opcional pero recomendado)
- Añadir `tokenVersion: { type: Number, default: 0 }` al schema `User`.
- En `jwt.sign`, incluir `tokenVersion`.
- En `authMiddleware`, comparar `decoded.tokenVersion === user.tokenVersion`.
- `POST /api/auth/logout` (autenticado): `User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } })`.

#### 3.8 Implementar `verificarCitasProximas.js` (o eliminar)
- Si vas a tener recordatorios reales: cron job con `node-cron` que corra cada hora, busque citas en las próximas 24 h con `recordatorioEnviado:false`, mande email con `nodemailer` y marque la cita.
- Si no vas a tenerlo: eliminar el archivo y el flag `recordatorioEnviado` del schema.

#### 3.9 PDFs privados
- En lugar de devolver URLs públicas de Cloudinary para los PDFs de evaluaciones, generar **signed URLs** con expiración corta en cada request:
  ```js
  cloudinary.utils.private_download_url(public_id, 'pdf', { expires_at: Math.floor(Date.now()/1000)+300 });
  ```
- Cambiar el resource_type a `private` en lugar de `raw` en `uploadConfig.js`.

**Criterio de cierre**: corres una batería de inputs basura contra cada endpoint (`{}`, strings vacíos, números negativos, ids inválidos, payloads de 10 MB) y el servidor responde 4xx coherentes, sin 500s, sin filtrar stacktraces.

---

## FASE 4 — Build, configuración por entorno, healthcheck (1-2 días)

**Objetivo**: el repo está listo para ejecutarse en un VPS.

### Tareas

#### 4.1 Variables de entorno por entorno
- Crear `server/.env.example` con todas las variables sin valores:
  ```
  MONGO_URI=
  JWT_SECRET=
  PORT=5000
  FRONTEND_URL=
  GMAIL_USER=
  GMAIL_PASS=
  CLOUDINARY_CLOUD=
  CLOUDINARY_KEY=
  CLOUDINARY_SECRET=
  NODE_ENV=production
  ```
- Reescribir `server/verificaEnv.js` para que valide al boot:
  ```js
  const required = ['MONGO_URI','JWT_SECRET','FRONTEND_URL','GMAIL_USER','GMAIL_PASS','CLOUDINARY_CLOUD','CLOUDINARY_KEY','CLOUDINARY_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) { console.error('Faltan envs:', missing.join(', ')); process.exit(1); }
  ```
- Importar y llamar a esa función en la primera línea de `server.js`.

#### 4.2 Script de inicio en producción
- Añadir scripts en `server/package.json`:
  ```json
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "bootstrap-admin": "node scripts/bootstrapAdmin.js"
  }
  ```

#### 4.3 Build del frontend
- `cd client && yarn build` debe generar `client/dist/`.
- Decisión: ¿servir el front desde el mismo backend o desde Nginx directo?
  - **Opción A** (recomendada para Hostinger VPS): Nginx sirve `client/dist/` como estático y hace proxy a `/api/*` al backend Node.
  - **Opción B**: Express sirve el `dist/` con `express.static`. Más simple pero menos eficiente.

#### 4.4 Healthcheck
- Reemplazar el `GET /ping` actual por `GET /api/health` que verifique:
  - Conexión a Mongo: `mongoose.connection.readyState === 1`.
  - Devuelve `{ status: 'ok', uptime, db: 'ok' }` con 200 o 503.

#### 4.5 Cierre limpio
- Manejar `SIGTERM` / `SIGINT` para cerrar Mongoose y el server HTTP antes de que PM2 mate el proceso:
  ```js
  process.on('SIGTERM', async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  ```

#### 4.6 `.gitignore` revisado
- Verificar que `node_modules/`, `.env*`, `client/dist/`, `uploads/` estén ignorados.
- **Nunca** commitear `.env`.

**Criterio de cierre**: `yarn build` funciona, `node server.js` con un `.env` correcto arranca; sin `.env` muere con mensaje claro; `/api/health` devuelve 200 con `db:'ok'`.

---

## FASE 5 — Despliegue en Hostinger VPS (1-2 días)

**Objetivo**: el proyecto corriendo en producción con HTTPS y dominio.

### Tareas

#### 5.1 Preparar el VPS
SSH al VPS como root, luego:
```bash
# Crear usuario no-root
adduser deploy
usermod -aG sudo deploy
# Endurecer SSH: editar /etc/ssh/sshd_config -> PermitRootLogin no, PasswordAuthentication no
systemctl restart ssh

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Node.js 20 LTS (vía nvm o NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Yarn, PM2, Nginx, certbot
sudo npm i -g yarn pm2
sudo apt install -y nginx certbot python3-certbot-nginx git
```

#### 5.2 Clonar y configurar la app
Como usuario `deploy`:
```bash
cd ~
git clone <tu-repo> proyecto
cd proyecto/server
cp .env.example .env
nano .env       # rellenar valores reales
yarn install --production

cd ../client
echo "VITE_API_URL=https://api.tudominio.com/api" > .env.production
yarn install
yarn build
```

#### 5.3 PM2 para el backend
```bash
cd ~/proyecto/server
pm2 start server.js --name api --update-env
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

#### 5.4 Nginx reverse proxy
`/etc/nginx/sites-available/tudominio.com`:
```nginx
# Frontend
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    root /home/deploy/proyecto/client/dist;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json;
}

# API
server {
    listen 80;
    server_name api.tudominio.com;
    client_max_body_size 12M;   # PDFs 5MB + margen
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Habilitar:
```bash
sudo ln -s /etc/nginx/sites-available/tudominio.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 5.5 DNS (Hostinger)
- En panel Hostinger DNS:
  - `A` record `@` → IP del VPS.
  - `A` record `www` → IP del VPS.
  - `A` record `api` → IP del VPS.
- Esperar propagación (5-30 min).

#### 5.6 SSL con Let's Encrypt
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com
```
Certbot auto-renueva cada 60 días por systemd timer.

#### 5.7 Bootstrap del admin
```bash
cd ~/proyecto/server
ADMIN_EMAIL=tucorreo@... ADMIN_PASSWORD='UnaContraseñaLarga!' node scripts/bootstrapAdmin.js
```

#### 5.8 Validar despliegue
- `curl https://api.tudominio.com/api/health` → 200.
- `https://tudominio.com/login` → carga la SPA.
- Login real con el admin recién creado.
- Crear una propiedad con imagen → verificar en Cloudinary.
- Forgot password → llega el email desde Gmail.

**Criterio de cierre**: el flujo completo (registro cliente → login → ver propiedades → marcar interés → agendar cita → recibir notificación) funciona en `https://tudominio.com`.

---

## FASE 6 — Operación y monitoreo (1 día + ongoing)

**Objetivo**: si algo se rompe en producción, te enteras y puedes restaurar.

### Tareas

#### 6.1 Logs
- `pm2 logs api --lines 200` para ver el backend.
- Configurar `pm2-logrotate`: `pm2 install pm2-logrotate`.
- Nginx logs en `/var/log/nginx/` — configurar logrotate (viene por defecto en Ubuntu).

#### 6.2 Backups MongoDB
- En Atlas: M0 no tiene backup automático; M10+ sí (snapshots diarios).
- Si usas M0: cron diario en el VPS con `mongodump`:
  ```bash
  0 3 * * * /usr/bin/mongodump --uri="$MONGO_URI" --out=/home/deploy/backups/$(date +\%F) && find /home/deploy/backups -mtime +14 -delete
  ```

#### 6.3 Monitoreo básico
- **UptimeRobot** (gratis): ping a `https://api.tudominio.com/api/health` cada 5 min → email/Telegram si cae.
- **Sentry** (free tier 5k eventos/mes): captura excepciones front y back. Instalar `@sentry/node` y `@sentry/react`.

#### 6.4 Alertas
- Configurar `pm2-slack` o webhook a Telegram si PM2 reinicia el proceso más de 3 veces en 5 min.

#### 6.5 Documentar runbook
- Cómo entrar al VPS, cómo redesplegar, cómo restaurar de backup, cómo rotar el `JWT_SECRET` (invalida todas las sesiones — usar `tokenVersion` mejor).

**Criterio de cierre**: simulas una caída (mata el proceso `pm2 stop api`) y UptimeRobot te avisa en <10 min.

---

## FASE 7 — CI/CD y mejoras continuas (opcional, 1-2 días)

**Objetivo**: cada push a `main` despliega automáticamente.

### Tareas

#### 7.1 GitHub Actions
`.github/workflows/deploy.yml`:
- `lint` + `build` en cada PR.
- En push a `main`: SSH al VPS, `git pull`, `yarn install`, `yarn build` (client), `pm2 reload api`.
- Necesita un secret `SSH_PRIVATE_KEY` con clave del usuario `deploy`.

#### 7.2 Tests
- README promete Jest + Cypress; añadirlos de verdad:
  - `jest` + `supertest` para los controllers (al menos auth + citas).
  - Cypress smoke test del login + crear cita.

#### 7.3 TypeScript (opcional)
- Migrar el backend a TS o al menos añadir JSDoc tipado. Reduce bugs de schema.

#### 7.4 Refactor a arquitectura por capas
- Extraer lógica de negocio (cálculo de potencial, simulador, esHoraDisponible) a `server/services/`.
- Controllers se quedan solo con request/response y llaman a services.

#### 7.5 Internacionalización (si lo necesitas)
- `react-i18next` si el target deja de ser solo Ecuador.

---

## Checklist final antes de "go live"

- [ ] Fase 1 completa (todas las críticas y altas cerradas).
- [ ] `admin@example.com / admin123` ya no existe en la BD de producción.
- [ ] `JWT_SECRET` rotado, longitud ≥ 64 caracteres.
- [ ] `.env` NO está en el repo. `git log --all --full-history -- "**.env"` está vacío.
- [ ] SSL activo (`https://tudominio.com` cargando con candado).
- [ ] Forgot password real funcionando (email llega, link cambia la contraseña).
- [ ] Subida de imagen funcionando contra Cloudinary.
- [ ] Healthcheck respondiendo 200.
- [ ] Backup de Mongo funcionando y restaurable.
- [ ] UptimeRobot alertando.
- [ ] Documentación de runbook escrita.

## Orden de prioridad si el tiempo es corto

Si tienes **1 semana** para desplegar de nuevo, hazlo en este orden y deja el resto pendiente:
1. Fase 1 (seguridad crítica) — **innegociable**.
2. Fase 2 (rutas protegidas + axios centralizado + env vars front) — **innegociable**.
3. Fase 4 (build + healthcheck + env validation).
4. Fase 5 (despliegue).
5. Fase 6.1 + 6.2 (logs + backup mínimo).

Las fases 3, 6.3-6.5 y 7 las trabajas después del despliegue, con la app ya en producción pero estable.
