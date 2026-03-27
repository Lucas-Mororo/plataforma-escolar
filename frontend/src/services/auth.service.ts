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
 * @param data - Credenciais do usuario.
 * @returns Token JWT (access + refresh) e dados basicos do usuario.
 *
 * @remarks
 * A resposta NAO inclui `is_admin`. O frontend deve chamar
 * `fetchMe()` apos login para obter permissoes verificadas server-side.
 */
export const loginRequest = async (data: {
    username: string;
    password: string;
}) => {
    const res = await api.post("/auth/login/", data);
    return res.data;
};

/**
 * Busca dados do usuario autenticado via token JWT.
 *
 * @returns Dados completos do usuario incluindo `is_admin` (server-verified).
 *
 * @remarks
 * Este endpoint e a unica fonte confiavel de `is_admin`.
 * Chamado apos login e em cada reload para validar o token.
 * Se o token for invalido, retorna 401 (tratado pelo `useAuthInitialize`).
 */
export const fetchMe = async (): Promise<User> => {
    const res = await api.get("/auth/me/");
    return res.data;
};

/**
 * Estatisticas do dashboard do usuario autenticado.
 *
 * Campos variam por role:
 * - Professor: total_atividades, atividades_ativas, respostas_recebidas, taxa_conclusao
 * - Aluno: total_atividades, respondidas, corrigidas, pendentes, media_notas
 */
export interface UserStats {
    total_atividades: number;
    /** Apenas professor: atividades com prazo futuro. */
    atividades_ativas?: number;
    /** Apenas professor: total de respostas recebidas em suas atividades. */
    respostas_recebidas?: number;
    /** Apenas professor: respostas ja corrigidas. */
    respostas_corrigidas?: number;
    /** Apenas professor: percentual de respostas corrigidas (0-100). */
    taxa_conclusao?: number;
    /** Apenas aluno: atividades que o aluno ja respondeu. */
    respondidas?: number;
    /** Apenas aluno: respostas com nota. */
    corrigidas?: number;
    /** Apenas aluno: respostas sem nota. */
    pendentes?: number;
    /** Apenas aluno: media aritmetica das notas. `null` se nenhuma corrigida. */
    media_notas?: number | null;
}

/**
 * Busca estatisticas do dashboard para o usuario autenticado.
 *
 * @returns Estatisticas calculadas server-side.
 */
export const fetchMeStats = async (): Promise<UserStats> => {
    const res = await api.get("/auth/me/stats/");
    return res.data;
};
