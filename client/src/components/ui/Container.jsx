/**
 * Container — envoltura de ancho máximo centrada.
 * Componente presentacional puro (sin lógica de negocio).
 *
 * @param {React.ElementType} as       Etiqueta semántica a renderizar (default: "div").
 * @param {boolean}           narrow   Usa el ancho de lectura estrecho (~760px).
 * @param {string}            className Clases extra.
 */
const Container = ({ as: Tag = "div", narrow = false, className = "", children, ...rest }) => (
    <Tag className={`${narrow ? "container-narrow" : "container"} ${className}`.trim()} {...rest}>
        {children}
    </Tag>
);

export default Container;
