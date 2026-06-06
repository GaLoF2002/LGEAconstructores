import { useEffect, useRef, useState } from "react";

/**
 * CountUp — anima un número de 0 al valor final cuando entra en viewport.
 * Componente presentacional puro. Respeta prefers-reduced-motion.
 *
 * @param {number} end        Valor final.
 * @param {string} suffix     Sufijo (p. ej. "+").
 * @param {number} duration   Duración de la animación en ms (default 1600).
 */
const CountUp = ({ end, suffix = "", duration = 1600 }) => {
    const [value, setValue] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { setValue(end); return; }

        let rafId;
        const animar = () => {
            const inicio = performance.now();
            const tick = (ahora) => {
                const t = Math.min((ahora - inicio) / duration, 1);
                // easing suave (easeOutCubic)
                const eased = 1 - Math.pow(1 - t, 3);
                setValue(Math.round(eased * end));
                if (t < 1) rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
        };

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) { animar(); obs.disconnect(); }
            },
            { threshold: 0.4 }
        );
        obs.observe(node);

        return () => { obs.disconnect(); cancelAnimationFrame(rafId); };
    }, [end, duration]);

    return <span ref={ref}>{value}{suffix}</span>;
};

export default CountUp;
