/**
 * Tipos relacionados a usuarios e autenticacao.
 * @module types/user
 */

import type { Turma } from "./turma";

/** Papeis possiveis de um usuario no sistema. */
export type UserRole = "ALUNO" | "PROFESSOR";

/**
 * Representa um usuario autenticado no sistema.
 *
 * O campo `is_admin` so esta presente quando os dados vem do endpoint
 * `/auth/me/` (verificado server-side). Nunca e retornado no login.
 */
export interface User {
    /** Identificador unico do usuario. */
    id: number;
    /** Nome de usuario (login). */
    username: string;
    /** Papel do usuario: ALUNO ou PROFESSOR. */
    role: UserRole;
    /** Turmas associadas ao usuario (preenchido para alunos). */
    turmas?: Turma[];
    /** Se o usuario esta ativo (pode fazer login). */
    is_active: boolean;
    /**
     * Se o usuario e administrador (superuser + ativo).
     * Calculado server-side no endpoint `/auth/me/`.
     * Nunca exposto na resposta do login.
     */
    is_admin?: boolean;
}

/** Resposta do endpoint `POST /auth/login/`. */
export interface LoginResponse {
    /** Token JWT de acesso (Bearer). */
    access: string;
    /** Token JWT de refresh. */
    refresh: string;
    /** Dados basicos do usuario (sem is_admin). */
    user: User;
}

/** Tipo do contexto de autenticacao (uso interno). */
export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
