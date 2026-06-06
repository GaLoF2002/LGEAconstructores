import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import { Button, Eyebrow } from "./ui";
import usePageMeta from "../hooks/usePageMeta";
import contactoImg from "../assets/edificio-forgotPass.jpg";
import "./Contact.css";

const WHATSAPP_NUMERO = "593998628563";
const WHATSAPP_MENSAJE = encodeURIComponent(
    "Hola LGEA Constructores, me interesa conocer más sobre sus propiedades."
);

const Contact = () => {
    const navigate = useNavigate();
    usePageMeta({
        title: "Contacto",
        description: "Contáctanos para conocer las propiedades de LGEA Constructores en Cumbayá y Tumbaco. Agenda una visita o escríbenos por WhatsApp.",
        path: "/contact",
    });

    return (
        <div className="contact-page-container">
            <Header />

            <section className="contact-layout">
                <div className="contact-info-col">
                    <Eyebrow>Contacto</Eyebrow>
                    <h1>Hablemos de tu próximo hogar.</h1>
                    <p className="contact-lead lede">
                        Estamos en Cumbayá, listos para conocerte y asesorarte. Escríbenos
                        por WhatsApp y te respondemos hoy mismo.
                    </p>

                    <a
                        className="contact-whatsapp"
                        href={`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAJE}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaWhatsapp className="contact-whatsapp__icon" aria-hidden="true" />
                        <span>
                            <strong>Escríbenos por WhatsApp</strong>
                            <small>Respuesta rápida · 099 862 8563</small>
                        </span>
                    </a>

                    <ul className="contact-info">
                        <li className="contact-info__item">
                            <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
                            <div>
                                <strong>Dirección</strong>
                                <span>Cumbayá, Urb. Jardines del Este, Quito, Ecuador, 170901</span>
                            </div>
                        </li>
                        <li className="contact-info__item">
                            <FaPhoneAlt className="contact-icon" aria-hidden="true" />
                            <div>
                                <strong>Móvil</strong>
                                <a href="tel:+593998628563">099 862 8563</a>
                            </div>
                        </li>
                        <li className="contact-info__item">
                            <FaEnvelope className="contact-icon" aria-hidden="true" />
                            <div>
                                <strong>Email</strong>
                                <a href="mailto:contacto@lgeaconstructores.com">contacto@lgeaconstructores.com</a>
                            </div>
                        </li>
                    </ul>

                    <div className="contact-actions">
                        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
                    </div>
                </div>

                <figure className="contact-media">
                    <img src={contactoImg} alt="Proyecto residencial de LGEA Constructores en Cumbayá" />
                    <figcaption>Cumbayá · Proyecto residencial LGEA</figcaption>
                </figure>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
