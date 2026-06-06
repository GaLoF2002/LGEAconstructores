  # 🏗️ LGEA Constructores — Plataforma de Gestión Inmobiliaria

  Aplicación web **full-stack (MERN)** para una constructora/inmobiliaria: gestión de propiedades,
  agendamiento de visitas, evaluación de compradores y analítica de negocio, con paneles
  diferenciados para **administrador, vendedor y cliente**.

  Incluye un módulo de **automatización con IA (n8n + Google Gemini)** que genera y envía
  reportes gerenciales semanales de forma autónoma.

  ![Stack](https://img.shields.io/badge/Stack-MERN-3FB984)
  ![React](https://img.shields.io/badge/React-19-61DAFB)
  ![Node](https://img.shields.io/badge/Node-Express_4-339933)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)
  ![Auth](https://img.shields.io/badge/Auth-JWT_httpOnly-orange)
  ![Automation](https://img.shields.io/badge/Automation-n8n_+_Gemini-FF6D5A)

  ---

  ## ✨ Características

  ### 👤 Por rol
  - **Cliente**: explora propiedades, marca favoritos, agenda visitas, completa su evaluación de
    compra (contado/crédito) y usa el simulador de financiamiento.
  - **Vendedor**: gestiona sus propiedades, define disponibilidad, atiende citas y consulta el
    **lead scoring** de compradores por propiedad.
  - **Administrador**: CRUD de vendedores, panel de indicadores (KPIs, gráficos), resumen mensual
    de citas y acceso global a compradores.

  ### 🔁 Automatización (el diferenciador)
  - **Reporte gerencial semanal automático**: un flujo en **n8n** consulta la API, **Google Gemini**
    redacta el análisis (resumen ejecutivo + lead scoring por probabilidad de cierre + comentario
    por propiedad) y lo envía al admin por **Gmail** — sin intervención humana.

  ---

  ## 🏛️ Arquitectura

  ```
  ┌────────────────────┐   HTTPS / Axios (cookie httpOnly)   ┌──────────────────────┐
  │  React 19 SPA      │ ──────────────────────────────────▶ │  Express 4 API       │
  │  Vite · Router 7   │            JSON · JWT                │  helmet · rate-limit │
  │  Context API       │ ◀────────────────────────────────── │  zod · controllers   │
  └────────────────────┘                                     └─────────┬────────────┘
                                                                        │ Mongoose
                                    ┌───────────────────────────────────┼───────────────────────┐
                                    ▼                                   ▼                        ▼
                             MongoDB Atlas                        Cloudinary               Gmail SMTP
                                    ▲
                                    │  API key (servicio)
                  ┌─────────────────┴─────────────────┐
                  │  n8n (Cron) → Gemini → PDF/HTML    │  ← Automatización del reporte semanal
                  └────────────────────────────────────┘
  ```

  Patrón **MVC por capas**: `routes → middlewares → controllers → models`.
  Frontend **SPA** con rutas protegidas por rol y cliente HTTP centralizado (interceptores Axios).

  ---

  ## 🛠️ Stack

  | Capa | Tecnologías |
  |---|---|
  | **Frontend** | React 19, React Router 7, Vite 6, Axios, Recharts, CSS con design tokens |
  | **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcrypt, Multer, Nodemailer, Zod, Pino |
  | **Base de datos** | MongoDB Atlas |
  | **Infra / Servicios** | Cloudinary (imágenes y PDFs), Gmail SMTP, Render (deploy) |
  | **Automatización** | n8n, Google Gemini API |

  ---

  ## 🔐 Seguridad (enfoque OWASP Top 10)

  - **Autenticación**: JWT en **cookie `httpOnly + Secure + SameSite=Lax`** (no en `localStorage`),
    con `tokenVersion` para invalidación (logout/refresh) y TTL de 1 día.
  - **Autorización**: RBAC (`requireRole`) + verificación de **propiedad del recurso** (ownership)
    en cada controlador sensible.
  - **Rate limiting**: limitador global + límites estrictos en login/registro/reset.
  - **Hardening**: `helmet`, `express-mongo-sanitize` (anti NoSQL injection), CORS con whitelist
    y *fail-fast*, validación de entrada con **Zod**, anti-enumeración de usuarios, anti-ReDoS.
  - **Datos**: contraseñas con bcrypt, tokens de reset hasheados (SHA-256), PDFs servidos con
    **URLs firmadas** de Cloudinary (no públicas).
  - **Frontend**: CSP, rutas protegidas, mensajes de error genéricos.

  ---

  ## ⚡ Rendimiento y escalabilidad

  - **Índices** en MongoDB sobre los campos de mayor consulta (citas, propiedades, evaluaciones, visitas).
  - **Caché en memoria** (`node-cache`) del listado/detalle público de propiedades, con invalidación
    automática en cada escritura.
  - **`Cache-Control` + ETag** en endpoints públicos (respuestas `304` condicionales).
  - **Paginación** en listados (`page`/`limit`).
  - Logger estructurado (`pino`), healthcheck (`/api/health`) y **cierre limpio** (SIGTERM/SIGINT).

  ---

  ## 📂 Estructura

  ```
  .
  ├── client/                 # React + Vite (SPA)
  │   └── src/
  │       ├── pages/          # Vistas por ruta (dashboards, formularios, listados)
  │       ├── components/     # Reutilizables (Header, Footer, UI, ProtectedRoute)
  │       ├── context/        # AuthContext, ToastContext
  │       └── services/       # Cliente HTTP (axiosInstance + un service por recurso)
  ├── server/                 # Node + Express (API REST)
  │   ├── controllers/        # Lógica por endpoint
  │   ├── routes/             # 12 routers REST
  │   ├── middlewares/        # auth, roles, rate-limit, validate, errorHandler, apiKey
  │   ├── models/             # Schemas Mongoose (con índices)
  │   ├── validators/         # Schemas Zod
  │   └── utils/              # caché en memoria
  └── n8n/                    # Workflow del reporte semanal + guía
  ```

  ---

  ## 🚀 Puesta en marcha (local)

  **Requisitos**: Node 20+, una base MongoDB (Atlas), cuenta Cloudinary y Gmail (app password).

  ```bash
  # Backend
  cd server
  npm install --legacy-peer-deps
  cp .env.example .env        # completa tus variables
  npm run bootstrap-admin     # crea el primer admin (una vez)
  npm run dev                 # http://localhost:5000

  # Frontend (otra terminal)
  cd client
  npm install
  npm run dev                 # http://localhost:5173
  ```

  ### Variables de entorno (`server/.env`)
  ```env
  MONGO_URI=...
  JWT_SECRET=...              # mínimo 32 caracteres
  FRONTEND_URL=http://localhost:5173
  GMAIL_USER=...
  GMAIL_PASS=...
  CLOUDINARY_CLOUD=...
  CLOUDINARY_KEY=...
  CLOUDINARY_SECRET=...
  REPORT_API_KEY=...          # (opcional) para el reporte automático de n8n
  ```

  ---

  ## 🤖 Automatización — Reporte semanal con IA

  Flujo en `n8n/` que cada lunes:

  1. **Cron** dispara el workflow.
  2. **HTTP** consulta `GET /api/reportes/semanal` (auth por API key de servicio).
  3. **Gemini** redacta: resumen ejecutivo, **lead scoring** (compradores ordenados por
     probabilidad de cierre) y comentario por propiedad.
  4. Se maqueta el reporte y se **envía por Gmail** al administrador.

  > Los números los calcula la API (siempre exactos); la IA solo aporta la narrativa y el scoring.
  > Guía paso a paso en [`n8n/README-reporte-semanal.md`](./n8n/README-reporte-semanal.md).

  ---

  ## ☁️ Despliegue

  Desplegado en **Render** como un único servicio: Express sirve el build de React **y** la API
  en el mismo dominio (la cookie `SameSite=Lax` funciona sin CSRF adicional).
  Guía completa en [`DEPLOY-RENDER.md`](./DEPLOY-RENDER.md).

  ---

  ## 🗺️ Roadmap

  - [ ] Tests automatizados (Jest + Cypress) y CI/CD con GitHub Actions
  - [ ] Recordatorios de cita por WhatsApp (n8n + WhatsApp Cloud API)
  - [ ] Caché distribuida (Redis) al escalar a múltiples instancias
  - [ ] Cifrado en reposo de campos financieros

  ---

  ## 👨‍💻 Autor

  **Andrés Estrella** — Desarrollador Full-Stack & Automatización
  Proyecto de Capstone · MERN + IA

  > Construido con foco en **seguridad, rendimiento y automatización** de procesos de negocio.


