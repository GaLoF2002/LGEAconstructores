import Eyebrow from "./Eyebrow";

/**
 * SectionHeader — encabezado de sección reutilizable (eyebrow + título + lede).
 * Componente presentacional puro.
 *
 * @param {string} eyebrow   Texto de la etiqueta superior (opcional).
 * @param {string} title     Título de la sección (serif display).
 * @param {string} lede      Texto introductorio (opcional).
 * @param {"left"|"center"} align  Alineación (default: "left").
 * @param {1|2|3}  level     Nivel semántico del encabezado (default: 2 → <h2>).
 */
const SectionHeader = ({ eyebrow, title, lede, align = "left", level = 2, className = "" }) => {
    const Heading = `h${level}`;
    const centered = align === "center";

    return (
        <header className={`section-header ${centered ? "section-header--center" : ""} ${className}`.trim()}>
            {eyebrow && <Eyebrow center={centered}>{eyebrow}</Eyebrow>}
            {title && <Heading className="section-header__title">{title}</Heading>}
            {lede && <p className="lede section-header__lede measure">{lede}</p>}
        </header>
    );
};

export default SectionHeader;
