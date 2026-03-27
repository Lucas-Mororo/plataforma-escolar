/**
 * Service de turmas.
 *
 * Contem funcoes para CRUD de turmas e listagem publica
 * (usada na tela de registro).
 *
 * @module services/resposta
 */

import api from "../api/axios";
import type { Turma } from "../types/turma";

/**
 * Cria uma nova turma (requer autenticacao + IsProfessor).
 *
 * @param nome - Nome da turma (ex: "1 Ano A").
 * @returns Turma criada.
 */
export const criarTurma = async (nome: string): Promise<Turma> => {
    const res = await api.post("/turmas/", { nome });
    return res.data;
};

/**
 * Lista todas as turmas (requer autenticacao + IsProfessor).
 *
 * @returns Lista de turmas.
 */
export const buscarTurmas = async (): Promise<Turma[]> => {
    const res = await api.get("/turmas/");
    return res.data;
};

/**
 * Lista todas as turmas sem autenticacao.
 *
 * Usado na tela de registro para que novos alunos possam
 * selecionar turmas antes de ter conta ativa.
 *
 * @returns Lista de turmas.
 */
export const buscarTurmasPublico = async (): Promise<Turma[]> => {
    const res = await api.get("/turmas/publico/");
    return res.data;
};
