/**
 * Instancia configurada do Axios para comunicacao com a API.
 *
 * Configuracoes:
 * - Base URL: `http://localhost:8000`
 * - Interceptor de request: injeta token JWT no header `Authorization`.
 * - Interceptor de response: trata erros 401 (token expirado/invalido).
 *
 * @remarks
 * O interceptor de response NAO faz redirect em requests para `/auth/me`.
 * Isso evita loop infinito com o `useAuthInitialize`, que trata 401
 * do `/auth/me` separadamente (limpa token sem redirect).
 *
 * @module api/axios
 */

import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

/**
 * Interceptor de request: injeta token JWT.
 * Busca o token do Zustand store ou localStorage como fallback.
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
 * - Para `/auth/me`: ignora (tratado pelo useAuthInitialize).
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
