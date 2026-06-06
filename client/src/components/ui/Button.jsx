/**
 * Button — botón del sistema de diseño.
 * Componente presentacional puro: no contiene lógica, sólo mapea props → clases.
 *
 * @param {"primary"|"secondary"|"accent"} variant  Estilo visual (default: "primary").
 * @param {"md"|"lg"}                       size     Tamaño (default: "md").
 * @param {React.ElementType}               as       Etiqueta a renderizar (default: "button").
 */
const VARIANT_CLASS = {
    primary: "",
    secondary: "btn-secondary",
    accent: "btn-accent",
};

const Button = ({
    variant = "primary",
    size = "md",
    as: Tag = "button",
    className = "",
    type,
    children,
    ...rest
}) => {
    const classes = [
        "btn",
        VARIANT_CLASS[variant] ?? "",
        size === "lg" ? "btn-lg" : "",
        className,
    ].filter(Boolean).join(" ");

    // Sólo aplicamos type cuando realmente es un <button>, para HTML válido.
    const typeProp = Tag === "button" ? { type: type ?? "button" } : {};

    return (
        <Tag className={classes} {...typeProp} {...rest}>
            {children}
        </Tag>
    );
};

export default Button;
