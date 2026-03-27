/**
 * Hook para exibir notificacoes toast.
 *
 * Wrapper sobre o `useToastStore` que expoe metodos tipados
 * por tipo de notificacao.
 *
 * @module hooks/useToast
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * toast.success("Salvo com sucesso!");
 * toast.error("Erro ao salvar");
 * ```
 */

import { useToastStore } from "../store/toast.store";

/**
 * Retorna metodos para exibir toasts por tipo.
 *
 * @returns Objeto com metodos `success`, `error`, `info`, `warning`.
 */
export const useToast = () => {
    const addToast = useToastStore((state) => state.addToast);

    return {
        /** Exibe toast verde de sucesso. */
        success: (message: string) => addToast(message, "success"),
        /** Exibe toast vermelho de erro. */
        error: (message: string) => addToast(message, "error"),
        /** Exibe toast azul informativo. */
        info: (message: string) => addToast(message, "info"),
        /** Exibe toast amarelo de aviso. */
        warning: (message: string) => addToast(message, "warning"),
    };
};
