/**
 * Service de autenticacao.
 *
 * Contem funcoes para login, buscar dados do usuario autenticado
 * e estatisticas do dashboard.
 *
 * @module services/auth
 */

import api from "../api/axios";
import type { User } from "../types/user";

/**
 * Realiza login do usuario.
 *
 * @param data - Credenciais do usuario (email + password).
 * @returns Token JWT (access + refresh) e dados basicos do usuario.
 */
export const loginRequest = async (data: {
    email: string;
    password: string;
}) => {
    const res = await api.post("/auth/login/", data);
    return res.data;
};

/**
 * Busca dados do usuario autenticado via token JWT.
 *
 * @returns Dados completos do usuario incluindo `is_admin` (server-verified).
 */
export const fetchMe = async (): Promise<User> => {
    const res = await api.get("/auth/me/");
    return res.data;
};

/**
 * Estatisticas do dashboard do usuario autenticado.
 */
export interface UserStats {
    total_atividades: number;
    atividades_ativas?: number;
    respostas_recebidas?: number;
    respostas_corrigidas?: number;
    taxa_conclusao?: number;
    respondidas?: number;
    corrigidas?: number;
    pendentes?: number;
    media_notas?: number | null;
}

/**
 * Busca estatisticas do dashboard para o usuario autenticado.
 */
export const fetchMeStats = async (): Promise<UserStats> => {
    const res = await api.get("/auth/me/stats/");
    return res.data;
};
