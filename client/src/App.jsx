import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

/* Code-splitting: cada vista se descarga sólo cuando se navega a su ruta.
   Esto saca recharts y los dashboards del bundle inicial. */
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SellerDashboard = lazy(() => import('./pages/VendedorDashboard'));
const Home = lazy(() => import('./pages/Home'));
const ClienteDashboard = lazy(() => import('./pages/ClienteDashboard'));
const Perfil = lazy(() => import('./pages/PerfilCliente.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Propiedades = lazy(() => import('./pages/Propiedades'));
const CrearPropiedad = lazy(() => import('./pages/CrearPropiedad'));
const AgendamientoVendedor = lazy(() => import('./pages/AgendamientoVendedor.jsx'));
const AgendarCita = lazy(() => import('./pages/AgendarCita.jsx'));
const GestionarCitasVendedor = lazy(() => import('./pages/GestionarCitasVendedor.jsx'));
const FormularioEvaluacion = lazy(() => import('./pages/FormularioEvaluacion'));
const AdminCompradoresPage = lazy(() => import('./pages/AdminCompradoresPage.jsx'));
const IndicadoresPage = lazy(() => import('./pages/IndicadoresPage.jsx'));
const SimuladorFinanciamiento = lazy(() => import('./pages/SimuladorFinanciamiento.jsx'));
const VistaPublicaPropiedad = lazy(() => import('./pages/VistaPublicaPropiedad'));
const PropiedadIndividual = lazy(() => import('./pages/PropiedadIndividual.jsx'));
const MisCitasCliente = lazy(() => import('./pages/MisCitasCliente.jsx'));
const ResumenMensualAdmin = lazy(() => import('./pages/ResumenMensualAdmin.jsx'));
const EstadisticasCitasVendedor = lazy(() => import('./pages/EstadisticasCitasVendedor.jsx'));
const About = lazy(() => import('./components/About.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));

// Fallback mientras se descarga el chunk de la ruta.
const RouteFallback = () => (
    <div className="route-fallback" role="status" aria-live="polite">
        <span className="route-fallback__spinner" aria-hidden="true" />
        <span className="route-fallback__text">Cargando…</span>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
            <Router>
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        {/* Públicas */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/propiedad/:id" element={<VistaPublicaPropiedad />} />

                        {/* Solo admin */}
                        <Route path="/admin" element={
                            <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
                        } />
                        <Route path="/admin/compradores" element={
                            <ProtectedRoute roles={["admin"]}><AdminCompradoresPage /></ProtectedRoute>
                        } />
                        <Route path="/resumen-mensual" element={
                            <ProtectedRoute roles={["admin"]}><ResumenMensualAdmin /></ProtectedRoute>
                        } />

                        {/* Vendedor o admin */}
                        <Route path="/vendedor" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><SellerDashboard /></ProtectedRoute>
                        } />
                        <Route path="/crear-propiedad" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><CrearPropiedad /></ProtectedRoute>
                        } />
                        <Route path="/agendamiento-vendedor" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><AgendamientoVendedor /></ProtectedRoute>
                        } />
                        <Route path="/gestionar-citas" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><GestionarCitasVendedor /></ProtectedRoute>
                        } />
                        <Route path="/estadistica-vendedor" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><EstadisticasCitasVendedor /></ProtectedRoute>
                        } />
                        <Route path="/indicadores" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><IndicadoresPage /></ProtectedRoute>
                        } />

                        {/* Cliente (o cualquiera autenticado) */}
                        <Route path="/cliente" element={
                            <ProtectedRoute roles={["cliente"]}><ClienteDashboard /></ProtectedRoute>
                        } />
                        <Route path="/cliente/mis-citas" element={
                            <ProtectedRoute roles={["cliente"]}><MisCitasCliente /></ProtectedRoute>
                        } />
                        <Route path="/cliente/evaluacion/:propiedadId" element={
                            <ProtectedRoute roles={["cliente"]}><FormularioEvaluacion /></ProtectedRoute>
                        } />
                        <Route path="/evaluacion" element={
                            <ProtectedRoute roles={["cliente"]}><FormularioEvaluacion /></ProtectedRoute>
                        } />
                        <Route path="/creacion-cita" element={
                            <ProtectedRoute roles={["cliente"]}><AgendarCita /></ProtectedRoute>
                        } />
                        <Route path="/simulador-financiamiento" element={
                            <ProtectedRoute><SimuladorFinanciamiento /></ProtectedRoute>
                        } />

                        {/* Cualquier sesión autenticada */}
                        <Route path="/perfil" element={
                            <ProtectedRoute><Perfil /></ProtectedRoute>
                        } />
                        <Route path="/propiedades" element={
                            <ProtectedRoute roles={["vendedor", "admin"]}><Propiedades /></ProtectedRoute>
                        } />
                    </Routes>
                </Suspense>
            </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
