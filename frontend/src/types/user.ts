/**
 * Tipos relacionados a usuarios e autenticacao.
 * @module types/user
 */

import type { Turma } from "./turma";

/** Papeis possiveis de um usuario no sistema. */
export type UserRole = "ALUNO" | "PROFESSOR";

/**
 * Representa um usuario autenticado no sistema.
 */
export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    turmas?: Turma[];
    is_active: boolean;
    is_admin?: boolean;
}

/** Resposta do endpoint `POST /auth/login/`. */
export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

/** Tipo do contexto de autenticacao (uso interno). */
export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
