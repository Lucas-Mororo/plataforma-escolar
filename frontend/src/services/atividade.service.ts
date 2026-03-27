/**
 * Service de atividades e respostas.
 *
 * Contem funcoes para CRUD de atividades (professor) e respostas (aluno),
 * alem de listagens com filtros e paginacao.
 *
 * @module services/atividade
 */

import api from "../api/axios";
import type { Atividade, AtividadeCreate } from "../types/atividade";
import type { Resposta, RespostaCreate, RespostaCorrecao } from "../types/resposta";
import type { PaginatedResponse } from "../types/pagination";

/**
 * Lista atividades do usuario autenticado.
 *
 * - Professor: atividades que ele criou.
 * - Aluno: atividades das turmas que pertence.
 *
 * @param params - Filtros opcionais: `search`, `status`, `turma`, `page`, `page_size`.
 * @returns Resposta paginada com atividades.
 */
export const getAtividades = async (params?: Record<string, string>): Promise<PaginatedResponse<Atividade>> => {
    const res = await api.get("/me/atividades/", { params });
    return res.data;
};

/**
 * Cria uma nova atividade.
 *
 * O campo `professor` e preenchido automaticamente pelo backend
 * com o usuario autenticado.
 *
 * @param data - Dados da atividade (titulo, descricao, data_entrega, turma[]).
 * @returns Atividade criada.
 */
export const criarAtividade = async (data: AtividadeCreate): Promise<Atividade> => {
    const res = await api.post("/atividades/", data);
    return res.data;
};

/**
 * Envia uma resposta para uma atividade (aluno).
 *
 * O campo `aluno` e preenchido automaticamente pelo backend.
 * Valida: turma do aluno, duplicidade, prazo de entrega.
 *
 * @param data - ID da atividade e texto da resposta.
 * @returns Resposta criada.
 */
export const enviarResposta = async (data: RespostaCreate): Promise<Resposta> => {
    const res = await api.post("/respostas/", data);
    return res.data;
};

/**
 * Lista respostas do aluno autenticado.
 *
 * @param params - Filtros opcionais: `search` (titulo da atividade), `status`, `page`.
 * @returns Resposta paginada com respostas do aluno.
 */
export const getMinhasRespostas = async (params?: Record<string, string>): Promise<PaginatedResponse<Resposta>> => {
    const res = await api.get("/me/respostas/", { params });
    return res.data;
};

/**
 * Lista respostas de uma atividade especifica (professor).
 *
 * O professor so pode ver respostas de atividades que ele criou.
 * Superusers podem ver de qualquer atividade.
 *
 * @param atividadeId - ID da atividade.
 * @param params - Filtros opcionais: `search` (nome do aluno), `status`, `page`.
 * @returns Resposta paginada com respostas da atividade.
 */
export const getRespostasAtividade = async (atividadeId: number, params?: Record<string, string>): Promise<PaginatedResponse<Resposta>> => {
    const res = await api.get(`/atividades/${atividadeId}/respostas/`, { params });
    return res.data;
};

/**
 * Atualiza uma resposta existente.
 *
 * Comportamento varia por role:
 * - Aluno: edita `texto` (apenas se prazo nao expirou).
 * - Professor/Admin: atribui `nota` e `feedback` (independente do prazo).
 *
 * @param respostaId - ID da resposta.
 * @param data - Dados a atualizar (`texto` para aluno, `nota`+`feedback` para professor).
 * @returns Resposta atualizada.
 */
export const atualizarResposta = async (
    respostaId: number,
    data: Partial<RespostaCreate | RespostaCorrecao>
): Promise<Resposta> => {
    const res = await api.patch(`/respostas/${respostaId}/`, data);
    return res.data;
};
