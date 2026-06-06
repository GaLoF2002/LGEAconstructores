# LGEA Constructores — Sistema de Diseño

> Dirección de arte: **Swiss Modernism 2.0 + Exaggerated Minimalism**
> Vibe: elegante · monumental · sólido · alto lujo.
> Stack: React 19 + Vite (CSS plano con tokens, sin dependencias de UI).

---

## 1. Principios

1. **Rejilla y ritmo matemático** — base de 8 px, grilla de 12 columnas, jerarquía clara.
2. **Whitespace agresivo** — el espacio negativo es el lujo. Secciones con `--section-y` fluido.
3. **Tipografía como protagonista** — títulos serif monumentales, cuerpo sans impecable.
4. **Un único acento** — dorado sobrio (`--color-accent`). Nada de neón ni colores vibrantes.
5. **Cantos vivos** — `border-radius: 0`. La solidez es arquitectónica, no redondeada.
6. **Hairlines, no sombras** — la separación se hace con líneas de 1 px, no con elevación.

---

## 2. Tokens (definidos en `src/index.css`)

### Color
| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#ffffff` | Fondo base |
| `--color-surface` | `#faf9f7` | Superficie cálida (stone 50) |
| `--color-surface-alt` | `#f3f1ee` | Superficie alterna |
| `--color-ink` / `--color-text` | `#0a0a0a` | Tinta / texto principal |
| `--color-text-soft` | `#3a3937` | Texto secundario |
| `--color-muted` | `#6f6b66` | Texto tenue (≥4.5:1 sobre blanco) |
| `--color-border` | `#e7e4df` | Hairline |
| `--color-border-strong` | `#cfcac3` | Borde de inputs/divisores fuertes |
| `--color-graphite` | `#161514` | Secciones sólidas oscuras (footer) |
| `--color-accent` | `#c9a961` | **Único** acento (dorado) |
| `--color-accent-dark` | `#a8884a` | Acento en hover/links |

### Tipografía
- **Display / títulos (h1–h3):** `--font-display` → **Playfair Display** (serif, alto contraste).
- **Cuerpo y UI:** `--font-sans` → **Inter**.
- Escala fluida: `--fs-xs … --fs-5xl`, `--fs-display` (hero exagerado, hasta 9rem).

### Espaciado / layout
- Escala `--sp-1 … --sp-40` (base 8 px).
- `--section-y` — ritmo vertical fluido de sección.
- `--container: 1240px`, `--container-narrow: 760px`, `--header-h: 84px`.
- Grilla: `--grid-cols: 12`, `--grid-gap` fluido.

### Movimiento
- `--transition` (200 ms) y `--transition-slow` (480 ms), curva `cubic-bezier(0.22,1,0.36,1)`.
- Respeta `prefers-reduced-motion` (desactiva animaciones).

---

## 3. Utilidades (clases globales)

| Clase | Qué hace |
|---|---|
| `.container` / `.container-narrow` | Ancho máximo centrado |
| `.section` / `.section--tight` | Ritmo vertical de sección |
| `.grid-12` | Grilla Swiss de 12 columnas (responsive 6 → 1) |
| `.eyebrow` / `.eyebrow--center` | Kicker uppercase con regla dorada |
| `.display` | Título monumental serif |
| `.lede` | Párrafo introductorio destacado |
| `.measure` | Longitud de línea legible (68ch) |
| `.rule` | Divisor hairline |
| `.btn` `.btn-secondary` `.btn-accent` `.btn-lg` | Botones (relleno deslizante, sin layout shift) |
| `.field` / `.label` | Campos de formulario |

---

## 4. Componentes reutilizables (`src/components/ui/`)

UI **presentacional pura** — sin lógica de negocio, sin servicios, sin navegación.
Importar desde el barril: `import { Button, Container, ... } from "../components/ui";`

| Componente | Props clave |
|---|---|
| `Container` | `as`, `narrow`, `className` |
| `Button` | `variant` (`primary`\|`secondary`\|`accent`), `size` (`md`\|`lg`), `as` |
| `Eyebrow` | `center` |
| `SectionHeader` | `eyebrow`, `title`, `lede`, `align`, `level` |
| `PropertyCard` | `propiedad`, `onSelect`, `formatPrecio` |

> **Separación UI/lógica:** los componentes reciben datos y callbacks por props.
> Ej.: `PropertyCard` no conoce `propiedadService` ni `react-router`; `Home` orquesta
> la lógica (fetch, paginación, navegación) y delega el render a `PropertyCard`.

---

## 5. Accesibilidad (verificado)

- Contraste de texto ≥ 4.5:1 (tinta/grises sobre blanco).
- Focus visible (`:focus-visible` con outline de 2 px).
- Botones icon-only / tarjeta clicable con `aria-label`.
- `PropertyCard` usa patrón *stretched link* (un único control enfocable por tarjeta).
- Modal de filtros con `role="dialog"` + `aria-modal` + `aria-labelledby`.
- Imágenes con `alt` descriptivo; `loading="lazy"` en el listado.
- `prefers-reduced-motion` respetado globalmente.

---

## 6. Alcance aplicado

✅ **Páginas públicas:** Home (hero + listado), Header, Footer, About, Contact.
↪ Login, Register, Forgot/Reset y VistaPublicaPropiedad **heredan** los tokens
  (serif, cantos vivos, botones, inputs) automáticamente.

⏳ **Pendiente (siguiente fase):** dashboards admin/vendedor/cliente — heredan tokens
  pero conservan su layout legacy; requieren tratamiento propio (tablas, charts Recharts
  con la paleta del sistema).
