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
    email: string;
    password: string;
    role: "ALUNO" | "PROFESSOR";
    /** IDs das turmas (obrigatorio para ALUNO). */
    turma?: number[];
}

/**
 * Cria um novo usuario via admin.
 */
export const criarUsuario = async (data: UserCreate): Promise<User> => {
    const res = await api.post("/usuarios/", data);
    return res.data;
};

/**
 * Lista todos os usuarios do sistema (admin-only).
 */
export const listarUsuarios = async (params?: Record<string, string>): Promise<PaginatedResponse<User>> => {
    const res = await api.get("/usuarios/lista/", { params });
    return res.data;
};

/**
 * Alterna o status ativo/inativo de um usuario (admin-only).
 */
export const toggleUsuario = async (userId: number): Promise<User> => {
    const res = await api.patch(`/usuarios/${userId}/toggle/`);
    return res.data;
};

/**
 * Registra um novo usuario (endpoint publico).
 */
export const registrarUsuario = async (data: UserCreate): Promise<User> => {
    const res = await api.post("/usuarios/", data);
    return res.data;
};
