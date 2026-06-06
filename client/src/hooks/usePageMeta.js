import { useEffect } from "react";

const SITE = "LGEA Constructores";
const DEFAULT_DESC =
    "Construcción y venta de propiedades residenciales premium en Cumbayá y Tumbaco, Quito.";

/** Crea o actualiza un <meta name=".."> / <meta property=".."> */
function setMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

/** Actualiza el <link rel="canonical"> */
function setCanonical(href) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

/** Inyecta/actualiza un bloque JSON-LD gestionado por el hook */
function setJsonLd(data) {
    const id = "page-jsonld";
    let el = document.getElementById(id);
    if (!data) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.id = id;
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

/**
 * usePageMeta — gestiona título, descripción, Open Graph, canonical y JSON-LD
 * por página en una SPA. Mantiene el SEO impecable sin librerías externas.
 *
 * @param {object}  opts
 * @param {string}  [opts.title]        Título de la página (se antepone a la marca).
 * @param {string}  [opts.description]  Meta description.
 * @param {string}  [opts.path]         Ruta para el canonical (ej. "/about").
 * @param {object}  [opts.jsonLd]       Datos estructurados schema.org para la página.
 */
export default function usePageMeta({ title, description, path, jsonLd } = {}) {
    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | Casas y departamentos en Cumbayá y Tumbaco`;
        const desc = description || DEFAULT_DESC;

        document.title = fullTitle;
        setMeta("name", "description", desc);
        setMeta("property", "og:title", fullTitle);
        setMeta("property", "og:description", desc);
        setMeta("name", "twitter:title", fullTitle);
        setMeta("name", "twitter:description", desc);

        if (path) {
            const url = `${window.location.origin}${path}`;
            setCanonical(url);
            setMeta("property", "og:url", url);
        }

        setJsonLd(jsonLd);

        return () => setJsonLd(null);
    }, [title, description, path, jsonLd]);
}
