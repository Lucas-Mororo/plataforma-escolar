/**
 * Store global de autenticacao (Zustand).
 *
 * Gerencia o estado de autenticacao do usuario: token JWT, dados do
 * usuario e estado de carregamento.
 *
 * O token e persistido no `localStorage` para sobreviver a reloads.
 * Os dados do usuario NAO sao persistidos — sao buscados via `/auth/me/`
 * a cada reload pelo `useAuthInitialize`.
 *
 * @remarks
 * O campo `is_admin` nos dados do usuario vem exclusivamente do servidor
 * via `/auth/me/`. Nunca e armazenado no localStorage para evitar
 * manipulacao pelo cliente.
 *
 * @module store/auth
 */

import { create } from "zustand";
import type { User } from "../types/user";

type AuthState = {
    /** Dados do usuario autenticado. `null` se nao logado. */
    user: User | null;
    /** Token JWT de acesso. Persistido no localStorage. */
    token: string | null;
    /** `true` durante a inicializacao (validacao do token via /auth/me/). */
    isLoading: boolean;
    /** Define token + usuario apos login bem-sucedido. */
    setAuth: (token: string, user: User) => void;
    /** Atualiza apenas os dados do usuario (usado pelo useAuthInitialize). */
    setUser: (user: User) => void;
    /** Limpa token e usuario. Remove token do localStorage. */
    logout: () => void;
    /** Controla o estado de carregamento. */
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem("token") || null,
    isLoading: true,

    setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user, isLoading: false });
    },

    setUser: (user) => {
        set({ user, isLoading: false });
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null, isLoading: false });
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },
}));
