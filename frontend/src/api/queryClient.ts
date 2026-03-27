/**
 * Instancia compartilhada do React Query Client.
 *
 * Exportada separadamente para ser acessivel tanto pelo `main.tsx`
 * (provider) quanto pelos hooks de auth (limpeza de cache no logout/login).
 *
 * Configuracoes:
 * - `retry: 1` — tenta novamente apenas 1 vez em caso de erro.
 * - `refetchOnWindowFocus: false` — nao refaz queries ao focar a janela.
 * - `staleTime: 5min` — dados ficam "frescos" por 5 minutos.
 *
 * @module api/queryClient
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});
