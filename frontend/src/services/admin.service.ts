/**
 * Service de endpoints administrativos (gestao).
 *
 * Todos os endpoints requerem `IsAdminUser` (superuser).
 * Usam o prefixo `/gestao/` para evitar conflito com o Django admin.
 *
 * @module services/admin
 */

import api from "../api/axios";
import type { Atividade } from "../types/atividade";
import type { Resposta } from "../types/resposta";
import type { PaginatedResponse } from "../types/pagination";

/**
 * Lista TODAS as atividades do sistema (admin).
 *
 * Diferente de `getAtividades`, nao filtra por professor.
 *
 * @param params - Filtros: `search`, `status`, `professor`, `turma`, `page`, `page_size`.
 * @returns Resposta paginada com todas as atividades.
 */
export const adminGetAtividades = async (params?: Record<string, string>): Promise<PaginatedResponse<Atividade>> => {
    const res = await api.get("/gestao/atividades/", { params });
    return res.data;
};

/**
 * Lista respostas de qualquer atividade (admin).
 *
 * Diferente de `getRespostasAtividade`, nao verifica se o usuario
 * e o professor dono da atividade.
 *
 * @param atividadeId - ID da atividade.
 * @param params - Filtros: `status`, `page`, `page_size`.
 * @returns Resposta paginada com respostas da atividade.
 */
export const adminGetRespostasAtividade = async (atividadeId: number, params?: Record<string, string>): Promise<PaginatedResponse<Resposta>> => {
    const res = await api.get(`/gestao/atividades/${atividadeId}/respostas/`, { params });
    return res.data;
};

/**
 * Lista TODAS as respostas do sistema (admin).
 *
 * @param params - Filtros: `search` (aluno ou atividade), `status`, `atividade`, `page`.
 * @returns Resposta paginada com todas as respostas.
 */
export const adminGetTodasRespostas = async (params?: Record<string, string>): Promise<PaginatedResponse<Resposta>> => {
    const res = await api.get("/gestao/respostas/", { params });
    return res.data;
};
