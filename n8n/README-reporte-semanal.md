# Automatización n8n — Reporte gerencial semanal con IA

Flujo automatizado que cada lunes genera un **reporte ejecutivo** del negocio inmobiliario
y lo envía al admin por **Gmail**, con análisis redactado por **IA (Google Gemini)**.

Cubre 3 cosas en un solo reporte:
1. **KPIs + ranking** — citas agendadas/ejecutadas, vendedores con más citas, leads, visitas.
2. **Lead scoring con IA** — ordena los compradores por probabilidad de cierre (más allá del `nivelPotencial`).
3. **Resumen por propiedad** — "esta casa tiene X interesados, Y de contado, ticket promedio $Z".

```
┌──────────────┐   ┌──────────────────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐
│ Cron (lunes) │──▶│ GET /api/reportes/semanal │──▶│ Gemini (IA)  │──▶│ Construir    │──▶│ Gmail al │
│ 8:00 am      │   │ (x-api-key)               │   │ análisis     │   │ HTML/PDF     │   │ admin    │
└──────────────┘   └──────────────────────────┘   └──────────────┘   └──────────────┘   └──────────┘
```

---

## 1. Backend (ya implementado)

- Endpoint: `GET /api/reportes/semanal?dias=7`
- Auth: header `x-api-key: <REPORT_API_KEY>` (variable en `server/.env`).
- Devuelve JSON ya agregado: `resumen`, `rankingVendedores`, `citasPorPropiedad`, `leads`, `resumenPorPropiedad`.

Probar en local:

```bash
curl -H "x-api-key: TU_REPORT_API_KEY" "http://localhost:5000/api/reportes/semanal?dias=30"
```

> Para el video/demo usa `?dias=90` o `?dias=365` para que el ranking de citas tenga datos.

---

## 2. Configurar n8n

### a) Importar el workflow
`n8n → Workflows → Import from File →` selecciona `reporte-semanal.workflow.json`.

### b) Reemplazar credenciales/placeholders
| Nodo | Qué cambiar |
|---|---|
| **Obtener datos** | URL de tu API (`http://TU_HOST:5000/...`) y el header `x-api-key` con tu `REPORT_API_KEY`. |
| **Análisis IA (Gemini)** | En la URL/clave, pon tu API key de Google AI Studio (`GEMINI_API_KEY`). |
| **Enviar al admin (Gmail)** | Conecta tu credencial Gmail OAuth2 y pon el correo del admin en `To`. |

> Si tu n8n y tu API están en la misma red/host, usa la IP interna o `host.docker.internal` en vez de `localhost`.

### c) API key de Gemini
1. Entra a **https://aistudio.google.com/apikey** y crea una API key (gratis).
2. Modelo usado: `gemini-2.0-flash` (rápido y barato; con tus ~$4 te alcanza para meses de reportes semanales).

---

## 3. El prompt de la IA (incluido en el nodo)

```
Eres un analista comercial inmobiliario. Con los DATOS en JSON, redacta en español un
fragmento HTML (solo <p>, <h3>, <ul>, <li>, <strong>; sin <html> ni <body>) con:

1) Resumen ejecutivo de 3-4 frases sobre la semana (citas, leads, visitas, propiedades con más interés).
2) <h3>Lead scoring</h3> con una lista ORDENADA de mayor a menor probabilidad de cierre.
   Por cada comprador: nombre, propiedad, probabilidad (Alta/Media/Baja) y una razón breve
   basada en tipoCompra, nivelPotencial, capacidadAhorroMensual, buro y tieneEntrada30.
3) <h3>Comentario por propiedad</h3> con 1 frase por propiedad destacada
   (interesados, contado vs crédito, ticket promedio).

Reglas: NO inventes datos que no estén en el JSON. Sé conciso y profesional.

DATOS:
<aquí se inyecta el JSON del endpoint>
```

Los **números** (KPIs, tablas) los arma el nodo "Construir HTML" directo del JSON (siempre exactos);
la IA solo aporta la **narrativa + el scoring + los comentarios**. Así nunca hay cifras inventadas.

---

## 4. PDF (opcional)

El workflow envía un **email HTML** (se ve como un reporte y es 100% gratis/sin dependencias).
Si quieres adjuntar un **PDF**:

- **Opción A — Gotenberg (self-hosted, gratis):** corre `docker run --rm -p 3000:3000 gotenberg/gotenberg:8`,
  agrega un nodo **HTTP Request** que haga `POST http://gotenberg:3000/forms/chromium/convert/html`
  enviando el HTML como archivo `index.html` (form-data) → devuelve el PDF binario → adjúntalo en Gmail.
- **Opción B — servicio externo** (PDFShift/CraftMyPDF, tienen free tier) con un nodo HTTP Request.

> Para un portafolio, el email HTML ya luce muy profesional; el PDF es un "extra".

---

## 5. Programación
El nodo **Schedule Trigger** está en semanal (lunes 08:00). Cámbialo a diario/mensual si prefieres.
Para la demo, ejecuta el workflow manualmente con **"Test workflow"**.
