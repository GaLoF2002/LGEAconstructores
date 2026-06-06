import NodeCache from 'node-cache';

/**
 * Caché en memoria (sin infraestructura extra) para respuestas de lectura frecuente.
 * stdTTL: vida por defecto de cada entrada (segundos).
 * useClones:false → guarda referencias (más rápido); no mutar los objetos cacheados.
 */
export const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });

// Prefijo para todo lo relacionado con propiedades (listado + detalle).
export const PROP_PREFIX = 'prop:';

/** Invalida toda la caché de propiedades (llamar tras crear/editar/eliminar). */
export const flushPropiedades = () => {
    const keys = cache.keys().filter(k => k.startsWith(PROP_PREFIX));
    if (keys.length) cache.del(keys);
};
