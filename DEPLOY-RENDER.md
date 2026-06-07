# Despliegue en Render (un solo servicio, gratis)

El **mismo servicio** de Render corre Express, que sirve la **API** (`/api/...`) **y** el build de
React (mismo dominio). Así la cookie de login (`SameSite=Lax`) funciona sin tocar nada.

> ⚠️ Plan free: el servicio **se duerme tras ~15 min sin uso**. La primera visita después
> tarda ~30–50 s en "despertar" (no muere; se reactiva solo). Mongo Atlas (M0) y Cloudinary
> ya están en la nube con free tier.

---

## 1. Subir el código a GitHub
Sube el repo a GitHub. Anota la ruta de la carpeta que contiene **`server.js`**
(en este proyecto: `.../ProyectoCapstone-main/server`). La necesitas para el paso 3.

## 2. Crear el Web Service
1. En [render.com](https://render.com) → **New +** → **Web Service**.
2. Conecta tu repo de GitHub.

## 3. Configuración del servicio
| Campo | Valor |
|---|---|
| **Language / Runtime** | `Node` |
| **Root Directory** | la carpeta que contiene `server.js` (ej. `ProyectoCapstone-main/server`) |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

> El `Build Command` instala dependencias del server + del client y compila el React
> (`vite build` → `client/dist`), que el server sirve en producción.

## 4. Variables de entorno (Environment)
El archivo `.env` **no** se sube (está en `.gitignore`), así que define TODO esto en Render
(**Environment → Add Environment Variable**). El server **no arranca** si falta alguna:

| Variable | Valor / nota |
|---|---|
| `NODE_ENV` | `production` (activa la cookie `Secure` y el servir el front) |
| `VITE_API_URL` | `/api` (el front llama a la API en el mismo dominio; Vite lo hornea en el build) |
| `MONGO_URI` | tu connection string de MongoDB Atlas |
| `JWT_SECRET` | secreto largo (**mínimo 32 caracteres**) |
| `FRONTEND_URL` | la URL pública de tu app en Render, ej. `https://lgea.onrender.com` |
| `GMAIL_USER` | **(opcional)** correo Gmail para recuperación de contraseña. Si se omite, la app arranca igual; solo no se envían esos correos. |
| `GMAIL_PASS` | **(opcional)** app password de Gmail (16 chars). |
| `CLOUDINARY_CLOUD` | cloud name **real** (coherente con key/secret) |
| `CLOUDINARY_KEY` | api key real |
| `CLOUDINARY_SECRET` | api secret real |
| `REPORT_API_KEY` | **(opcional)** clave para el reporte semanal de n8n. Sin ella, `/api/reportes` responde 503; el resto de la app funciona igual. Usa la misma del `.env` local o genera otra de 48+ chars. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` / `ADMIN_PHONE` | para crear el primer admin (paso 6) |

> **No** definas `PORT`: Render lo asigna solo y el server ya lo usa (`process.env.PORT`).
> **Sí** define `VITE_API_URL=/api`: el archivo `client/.env.production` está en `.gitignore`
> (no se sube), así que la variable de Render es la que el build de Vite usa para apuntar
> el front a la API del mismo dominio.

## 5. Desplegar
Dale **Create Web Service**. Render hará build + deploy. Cuando termine, tu app vivirá en
`https://<nombre>.onrender.com`. Asegúrate de que `FRONTEND_URL` coincida con esa URL.

## 6. Crear el primer admin (una sola vez)
En el servicio → pestaña **Shell** (o Render Shell), ejecuta:
```
npm run bootstrap-admin
```
Usa las variables `ADMIN_*` ya definidas. Con eso ya puedes entrar como admin.

---

## Opcional (recomendado para SEO)
Reemplaza el dominio placeholder `https://www.lgeaconstructores.com` por tu URL de Render en:
- `client/index.html` (canonical, Open Graph; el `connect-src 'self'` de la CSP ya cubre la API)
- `client/public/robots.txt`
- `client/public/sitemap.xml`

## Si algo falla
- **Build falla por peer deps de Cloudinary**: ya está cubierto (`--legacy-peer-deps` en el build).
- **El server no arranca / "Faltan variables de entorno"**: revisa que TODAS las del paso 4 estén puestas y que `JWT_SECRET` tenga ≥32 caracteres.
- **Las imágenes no suben (500)**: credenciales de Cloudinary incorrectas (cloud name debe ser del mismo par key/secret).
- **Login no persiste**: confirma `NODE_ENV=production` y que entras por `https://` (la cookie es `Secure`).
