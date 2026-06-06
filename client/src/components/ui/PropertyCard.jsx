import { useState } from "react";
import {
    TbBed, TbBath, TbCar, TbRuler2, TbMapPin,
    TbChevronLeft, TbChevronRight
} from "react-icons/tb";

/**
 * PropertyCard — tarjeta de propiedad (presentacional puro).
 * Incluye un carrusel ("tambor") de imágenes para ojear la propiedad sin entrar
 * al detalle, y una fila de especificaciones con iconos.
 *
 * La tarjeta entera es activable (rol button + teclado). Los controles del
 * carrusel detienen la propagación para no disparar la navegación al detalle.
 *
 * @param {object}   propiedad     Datos de la propiedad.
 * @param {Function} onSelect      Callback al activar la tarjeta (recibe el id).
 * @param {Function} formatPrecio  Formateador de precio (valor → string).
 */
const PropertyCard = ({ propiedad: p, onSelect, formatPrecio }) => {
    const imagenes = p.imagenes?.length ? p.imagenes : [];
    const total = imagenes.length;
    const [idx, setIdx] = useState(0);

    const mover = (e, dir) => {
        e.stopPropagation();
        setIdx((prev) => (prev + dir + total) % total);
    };

    const irA = (e, i) => {
        e.stopPropagation();
        setIdx(i);
    };

    const activar = () => onSelect?.(p._id);

    const specs = [
        { Icon: TbBed, label: "Hab.", value: p.habitaciones },
        { Icon: TbBath, label: "Baños", value: p.banos },
        { Icon: TbCar, label: "Parq.", value: p.parqueaderos },
        { Icon: TbRuler2, label: "m²", value: p.metrosCuadrados },
    ];

    return (
        <article
            className="property-card"
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${p.titulo}`}
            onClick={activar}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activar();
                }
            }}
        >
            <div className="property-card__media">
                {total > 0 ? (
                    <div
                        className="property-card__track"
                        style={{ transform: `translateX(-${idx * 100}%)` }}
                    >
                        {imagenes.map((src, i) => (
                            <img key={i} src={src} alt={`${p.titulo} — imagen ${i + 1}`} loading="lazy" />
                        ))}
                    </div>
                ) : (
                    <div className="property-card__placeholder" aria-hidden="true">Sin imagen</div>
                )}

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            className="property-card__nav property-card__nav--prev"
                            onClick={(e) => mover(e, -1)}
                            aria-label="Imagen anterior"
                        >
                            <TbChevronLeft aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="property-card__nav property-card__nav--next"
                            onClick={(e) => mover(e, 1)}
                            aria-label="Imagen siguiente"
                        >
                            <TbChevronRight aria-hidden="true" />
                        </button>
                        <div className="property-card__dots">
                            {imagenes.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`property-card__dot ${i === idx ? "is-active" : ""}`}
                                    onClick={(e) => irA(e, i)}
                                    aria-label={`Ver imagen ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {p.tipo && <span className="property-card__tag">{p.tipo}</span>}
            </div>

            <div className="property-card__body">
                <h3 className="property-card__title">{p.titulo}</h3>

                {p.ubicacion && (
                    <p className="property-card__location">
                        <TbMapPin aria-hidden="true" /> {p.ubicacion}
                    </p>
                )}

                <dl className="property-card__features">
                    {specs.map(({ Icon, label, value }) => (
                        <div key={label}>
                            <dt><Icon aria-hidden="true" />{label}</dt>
                            <dd>{value ?? "—"}</dd>
                        </div>
                    ))}
                </dl>

                <div className="property-card__footer">
                    <span className="property-card__price">{formatPrecio(p.precio)}</span>
                    <span className="property-card__more" aria-hidden="true">Ver detalles →</span>
                </div>
            </div>
        </article>
    );
};

export default PropertyCard;
