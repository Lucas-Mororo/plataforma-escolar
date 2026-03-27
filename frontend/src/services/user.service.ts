/**
 * Service de gerenciamento de usuarios.
 *
 * Contem funcoes para registro publico, listagem admin e toggle de status.
 *
 * @module services/user
 */

import api from "../api/axios";
import type { User } from "../types/user";
import type { PaginatedResponse } from "../types/pagination";

/** Payload para criacao de usuario (registro ou admin). */
export interface UserCreate {
    username: string;
    password: string;
    role: "ALUNO" | "PROFESSOR";
    /** IDs das turmas (obrigatorio para ALUNO). */
    turma?: number[];
}

/**
 * Cria um novo usuario via admin.
 *
 * O usuario inicia com `is_active=false`.
 *
 * @param data - Dados do usuario.
 * @returns Usuario criado.
 */
export const criarUsuario = async (data: UserCreate): Promise<User> => {
    const res = await api.post("/usuarios/", data);
    return res.data;
};

/**
 * Lista todos os usuarios do sistema (admin-only).
 *
 * @param params - Filtros: `search`, `role`, `status`, `turma`, `page`, `page_size`.
 * @returns Resposta paginada com usuarios (inclui `is_admin`).
 */
export const listarUsuarios = async (params?: Record<string, string>): Promise<PaginatedResponse<User>> => {
    const res = await api.get("/usuarios/lista/", { params });
    return res.data;
};

/**
 * Alterna o status ativo/inativo de um usuario (admin-only).
 *
 * Nao permite alterar status de superusers.
 *
 * @param userId - ID do usuario.
 * @returns Usuario com status atualizado.
 */
export const toggleUsuario = async (userId: number): Promise<User> => {
    const res = await api.patch(`/usuarios/${userId}/toggle/`);
    return res.data;
};

/**
 * Registra um novo usuario (endpoint publico).
 *
 * Identico a `criarUsuario` mas semanticamente usado na tela de registro.
 *
 * @param data - Dados do usuario.
 * @returns Usuario criado (is_active=false).
 */
export const registrarUsuario = async (data: UserCreate): Promise<User> => {
    const res = await api.post("/usuarios/", data);
    return res.data;
};
