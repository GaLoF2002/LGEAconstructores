import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/authService';
import edificioImg from '../assets/edificio-register.jpg';
import { AuthLayout, Button } from './ui';
import usePageMeta from '../hooks/usePageMeta';
import './Register.css';

const Register = () => {
    usePageMeta({ title: "Crear cuenta", path: "/register" });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
    const navigate = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError('');

        if (!aceptaPoliticas) {
            setGeneralError("Debes aceptar las políticas y condiciones para continuar.");
            return;
        }

        try {
            await registerUser({ name, email, password, phone });
            navigate('/login', { state: { mensaje: "Cuenta creada. Ya puedes iniciar sesión." } });
        } catch (error) {
            const data = error.response?.data;
            if (data?.details) {
                const errors = {};
                data.details.forEach(({ path, message }) => { errors[path] = message; });
                setFieldErrors(errors);
            } else if (data?.error === "No se pudo completar el registro") {
                setFieldErrors({ email: "Ya existe una cuenta con ese correo." });
            } else {
                setGeneralError("No se pudo completar el registro. Intenta de nuevo.");
            }
        }
    };

    return (
        <AuthLayout
            image={edificioImg}
            eyebrow="Únete"
            title="Crea tu cuenta."
            subtitle="Accede a propiedades exclusivas, agenda visitas y sigue tu evaluación."
            aside="Cada proyecto comienza con una conversación."
        >
            <form className="auth__form" onSubmit={handleRegister}>
                <label className="field">
                    <span>Nombre completo</span>
                    <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    {fieldErrors.name && <span className="field__error">{fieldErrors.name}</span>}
                </label>
                <label className="field">
                    <span>Correo electrónico</span>
                    <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
                </label>
                <label className="field">
                    <span>Contraseña <small className="field__hint">(mín. 8 caracteres)</small></span>
                    <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
                </label>
                <label className="field">
                    <span>Teléfono celular</span>
                    <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    {fieldErrors.phone && <span className="field__error">{fieldErrors.phone}</span>}
                </label>

                <label className="politicas-container">
                    <input
                        type="checkbox"
                        checked={aceptaPoliticas}
                        onChange={() => setAceptaPoliticas(!aceptaPoliticas)}
                    />
                    <span>
                        Acepto las{" "}
                        <a
                            href="/politicas"
                            onClick={(e) => { e.preventDefault(); setMostrarModal(true); }}
                            className="link-text"
                        >
                            políticas y condiciones
                        </a>
                    </span>
                </label>

                {generalError && <p className="auth__error">{generalError}</p>}
                <Button type="submit" variant="accent" size="lg">Unirse</Button>
            </form>

            <div className="auth__meta">
                <span>¿Ya estás registrado? <a href="/login">Inicia sesión</a></span>
            </div>

            {mostrarModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="politicas-titulo">
                    <div className="modal-content">
                        <h3 id="politicas-titulo">Política de Tratamiento de Datos Personales</h3>
                        <p>
                            Al continuar con este proceso, usted declara que ha leído y acepta los términos y condiciones establecidos.
                            Autorizo expresamente la recopilación, almacenamiento, tratamiento y uso de mis datos personales con fines
                            estrictamente relacionados con la evaluación de mi perfil como cliente, el análisis de capacidad de compra,
                            el ofrecimiento de productos o servicios inmobiliarios, el contacto comercial y la mejora de la experiencia del usuario.
                        </p>
                        <p>
                            Mis datos serán tratados conforme a lo establecido en la <strong>Ley Orgánica de Protección de Datos Personales del Ecuador</strong>,
                            garantizando su confidencialidad, integridad y un uso legítimo y responsable. En ningún caso mis datos serán vendidos ni
                            compartidos con terceros sin mi consentimiento previo, salvo en los casos establecidos por la ley.
                        </p>
                        <Button onClick={() => setMostrarModal(false)}>Cerrar</Button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};

export default Register;
