import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// withCredentials: el navegador envía/recibe la cookie httpOnly del JWT.
// Requiere CORS con credentials:true y origin whitelisteado (no '*'), ya configurado en el server.
const instance = axios.create({ baseURL, withCredentials: true });

// 401 → sesión inválida: limpia el user local y redirige al login.
let redirecting = false;
instance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && !redirecting) {
            redirecting = true;
            localStorage.removeItem("user");
            // Pequeño delay para no romper si se está renderizando
            setTimeout(() => {
                redirecting = false;
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }, 0);
        }
        return Promise.reject(err);
    }
);

export default instance;
