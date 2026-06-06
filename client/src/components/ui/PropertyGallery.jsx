import { useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import "./PropertyGallery.css";

/**
 * PropertyGallery — galería de detalle estilo editorial.
 * Imagen principal grande (respeta aspect-ratio) + tira de miniaturas.
 * Soporta resolver rutas relativas con `apiUrl`.
 *
 * @param {string[]} imagenes  URLs (o rutas) de las imágenes.
 * @param {string}   titulo    Título de la propiedad (para alt accesible).
 * @param {string}   [apiUrl]  Base para rutas relativas (las absolutas se usan tal cual).
 */
const PropertyGallery = ({ imagenes = [], titulo = "Propiedad", apiUrl = "" }) => {
    const [activo, setActivo] = useState(0);

    if (!imagenes.length) return null;

    const resolver = (img) => (img?.startsWith("http") ? img : `${apiUrl}/${img}`);
    const total = imagenes.length;
    const mover = (dir) => setActivo((prev) => (prev + dir + total) % total);

    return (
        <div className="gallery">
            <div className="gallery__main">
                <img src={resolver(imagenes[activo])} alt={`${titulo} — imagen ${activo + 1}`} />

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            className="gallery__nav gallery__nav--prev"
                            onClick={() => mover(-1)}
                            aria-label="Imagen anterior"
                        >
                            <TbChevronLeft aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="gallery__nav gallery__nav--next"
                            onClick={() => mover(1)}
                            aria-label="Imagen siguiente"
                        >
                            <TbChevronRight aria-hidden="true" />
                        </button>
                        <span className="gallery__counter">{activo + 1} / {total}</span>
                    </>
                )}
            </div>

            {total > 1 && (
                <div className="gallery__thumbs" role="tablist" aria-label="Miniaturas">
                    {imagenes.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === activo}
                            className={`gallery__thumb ${i === activo ? "is-active" : ""}`}
                            onClick={() => setActivo(i)}
                        >
                            <img src={resolver(img)} alt={`${titulo} miniatura ${i + 1}`} loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PropertyGallery;
