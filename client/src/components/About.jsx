import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Button, Eyebrow, CountUp } from './ui';
import usePageMeta from '../hooks/usePageMeta';
import nosotrosImg from '../assets/edificio-resetPass.jpg';
import './About.css';

const About = () => {
    const navigate = useNavigate();
    usePageMeta({
        title: "Sobre nosotros",
        description: "Conoce a LGEA Constructores: trece años construyendo proyectos residenciales de calidad en Cumbayá y Tumbaco, Quito.",
        path: "/about",
    });

    return (
        <div className="about-page-container">
            <Header />

            <article className="about-content">
                <header className="about-head">
                    <Eyebrow>La firma</Eyebrow>
                    <h1>Construimos permanencia.</h1>
                </header>

                <div className="about-intro">
                    <p className="about-lede lede">
                        <strong>LGEA Constructores S.A.S.</strong> es una empresa ecuatoriana con más de 13 años de experiencia en el sector de la
                        construcción, especializada en la edificación de proyectos residenciales en las
                        prestigiosas zonas de Cumbayá y Tumbaco. A lo largo de su trayectoria, ha
                        consolidado su reputación como un referente en el sector inmobiliario,
                        ofreciendo soluciones integrales y personalizadas.
                    </p>
                    <figure className="about-figure">
                        <img src={nosotrosImg} alt="Proyecto residencial de LGEA Constructores" />
                    </figure>
                </div>

                <div className="about-prose">
                    <p>
                        Desde sus inicios, la empresa se ha centrado en la
                        <strong> innovación y la sostenibilidad</strong>, ajustando cada proyecto a las demandas
                        específicas del cliente y a las exigencias del entorno. Su misión de brindar
                        viviendas de excelente calidad al mejor precio del mercado refleja su
                        compromiso con la accesibilidad y la responsabilidad ambiental.
                    </p>
                    <p>
                        LGEA Constructores busca posicionarse como
                        líder en el mercado, marcando tendencias en el ámbito de la construcción
                        gracias a su enfoque orientado a la calidad y la excelencia. Su visión
                        empresarial está respaldada por valores fundamentales como la <strong>seriedad, el
                        compromiso con el cliente, la honestidad y el profesionalismo</strong>.
                    </p>
                    <p>
                        Además de su enfoque en la construcción de edificios
                        residenciales, la empresa también desarrolla actividades en la
                        construcción de edificios no residenciales, gestión inmobiliaria y servicios
                        relacionados, posicionándose como una solución integral.
                    </p>
                </div>

                <div className="about-actions">
                    <Button onClick={() => navigate('/')}>Regresar al inicio</Button>
                    <Button variant="secondary" onClick={() => navigate('/contact')}>
                        Hablar con nosotros
                    </Button>
                </div>
            </article>

            {/* Franja grafito con contadores animados */}
            <section className="about-stats">
                <div className="about-stats__inner">
                    <div className="about-stat">
                        <span className="about-stat__num"><CountUp end={13} suffix="+" /></span>
                        <span className="about-stat__label">Años de trayectoria</span>
                    </div>
                    <div className="about-stat">
                        <span className="about-stat__num"><CountUp end={2} /></span>
                        <span className="about-stat__label">Zonas exclusivas</span>
                    </div>
                    <div className="about-stat">
                        <span className="about-stat__num"><CountUp end={4} /></span>
                        <span className="about-stat__label">Valores que nos guían</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
