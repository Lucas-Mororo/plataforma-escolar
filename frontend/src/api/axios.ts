/**
 * Instância configurada do Axios para comunicação com a API.
 *
 * A base URL é lida da variável de ambiente `VITE_API_URL`.
 * Em desenvolvimento: `http://localhost:8000`
 * Em produção: configurar no `.env` do frontend.
 *
 * @module api/axios
 */

import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Interceptor de request: injeta token JWT.
 */
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token || localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Interceptor de response: trata 401 (Unauthorized).
 *
 * - Para requests normais: faz logout + redirect para /login.
 * - Para `/auth/`: ignora (tratado pelo useAuthInitialize).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || "";
            if (!url.includes("/auth/")) {
                useAuthStore.getState().logout();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
