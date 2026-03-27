/**
 * Hooks de autenticacao.
 *
 * Gerenciam login, logout, inicializacao e acesso aos dados do usuario.
 *
 * Fluxo de autenticacao:
 * 1. `useLogin` — envia credenciais, recebe token, busca `/auth/me/` para `is_admin`.
 * 2. `useAuthInitialize` — no reload, valida token via `/auth/me/`.
 * 3. `useLogout` — limpa cache do React Query + estado do Zustand.
 *
 * @module hooks/useAuth
 */

import { useMutation } from "@tanstack/react-query";
import { loginRequest, fetchMe } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useRef } from "react";
import { queryClient } from "../api/queryClient";

/**
 * Hook para realizar login.
 *
 * Fluxo:
 * 1. Envia `POST /auth/login/` com username + password.
 * 2. Recebe token JWT + dados basicos do usuario.
 * 3. Limpa cache do React Query (dados do usuario anterior).
 * 4. Salva token no store e localStorage.
 * 5. Chama `GET /auth/me/` para obter `is_admin` (server-verified).
 * 6. Se `/auth/me/` falhar, usa dados do login como fallback (sem `is_admin`).
 *
 * @returns Mutation do React Query com `mutate(credentials)`.
 */
export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: loginRequest,
        onSuccess: async (data) => {
            queryClient.clear();
            useAuthStore.setState({ token: data.access });
            localStorage.setItem("token", data.access);

            try {
                const me = await fetchMe();
                setAuth(data.access, me);
            } catch {
                setAuth(data.access, data.user);
            }
        },
    });
};

/**
 * Hook para realizar logout.
 *
 * Limpa todo o cache do React Query e o estado de autenticacao.
 * O redirect para `/login` e feito pelo componente que chama o logout.
 *
 * @returns Funcao de logout.
 */
export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    return () => {
        queryClient.clear();
        logout();
    };
};

/**
 * Hook para acessar dados do usuario autenticado.
 *
 * @returns Objeto com `user`, `token` e `isAuthenticated`.
 */
export const useAuthUser = () => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    return { user, token, isAuthenticated: !!token && !!user };
};

/**
 * Hook de inicializacao da autenticacao.
 *
 * Executado uma unica vez no `App.tsx` (via `useRef` para evitar
 * dupla execucao no StrictMode do React 19).
 *
 * Fluxo:
 * 1. Se nao ha token no localStorage → `isLoading = false` (nao logado).
 * 2. Se ha token → chama `GET /auth/me/` para validar.
 * 3. Se `/auth/me/` retorna 200 → seta usuario com `is_admin` verificado.
 * 4. Se `/auth/me/` retorna 401 → limpa token (expirado/invalido).
 *    O `ProtectedRoute` redireciona para `/login`.
 *
 * @remarks
 * O interceptor do axios NAO faz redirect em 401 de `/auth/me/`.
 * Isso evita loop infinito (redirect → reload → fetchMe → 401 → redirect).
 *
 * @returns `{ isLoading }` — `true` enquanto valida o token.
 */
export const useAuthInitialize = () => {
    const isLoading = useAuthStore((state) => state.isLoading);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const token = useAuthStore.getState().token;

        if (!token) {
            useAuthStore.getState().setLoading(false);
            return;
        }

        fetchMe()
            .then((me) => {
                useAuthStore.getState().setUser(me);
            })
            .catch(() => {
                localStorage.removeItem("token");
                useAuthStore.setState({ token: null, user: null, isLoading: false });
            });
    }, []);

    return { isLoading };
};
