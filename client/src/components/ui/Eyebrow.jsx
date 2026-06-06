/**
 * Eyebrow — etiqueta superior (kicker) con regla dorada.
 * Componente presentacional puro.
 *
 * @param {boolean} center  Variante centrada (oculta la regla).
 */
const Eyebrow = ({ center = false, className = "", children, ...rest }) => (
    <span className={`eyebrow ${center ? "eyebrow--center" : ""} ${className}`.trim()} {...rest}>
        {children}
    </span>
);

export default Eyebrow;
