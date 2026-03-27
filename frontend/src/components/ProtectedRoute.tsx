/**
 * Componente de protecao de rotas baseado em autenticacao e permissoes.
 *
 * Verifica se o usuario esta autenticado e possui o papel (role) ou
 * privilegio de admin necessario para acessar a rota.
 *
 * Hierarquia de verificacao:
 * 1. Se `isLoading` → exibe spinner (aguardando validacao do token).
 * 2. Se nao autenticado → redirect para `/login`.
 * 3. Se `requireAdmin` e usuario nao e admin → redirect para dashboard do role.
 * 4. Se `role` especificado e usuario tem role diferente → redirect.
 * 5. Se tudo ok → renderiza `children`.
 *
 * @module components/ProtectedRoute
 *
 * @example
 * ```tsx
 * // Rota apenas para alunos
 * <ProtectedRoute role="ALUNO"><Dashboard /></ProtectedRoute>
 *
 * // Rota apenas para admin (superuser)
 * <ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>
 * ```
 */

import { Navigate } from "react-router-dom";
import type { UserRole } from "../types/user";
import { useAuthStore } from "../store/auth.store";

/**
 * @param children - Componente a ser renderizado se autorizado.
 * @param role - Role necessario para acessar (ALUNO ou PROFESSOR).
 * @param requireAdmin - Se `true`, exige `is_admin` (superuser verificado server-side).
 */
export default function ProtectedRoute({
    children,
    role,
    requireAdmin,
}: {
    children: React.ReactNode;
    role?: UserRole;
    requireAdmin?: boolean;
}) {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !user.is_admin) {
        return <Navigate to={user.role === "ALUNO" ? "/aluno" : "/professor"} replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to={user.role === "ALUNO" ? "/aluno" : "/professor"} replace />;
    }

    return children;
}
