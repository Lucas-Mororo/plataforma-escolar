/**
 * Store de notificacoes toast (Zustand).
 *
 * Gerencia uma fila de toasts exibidos pelo `ToastContainer`.
 * Cada toast e removido automaticamente apos `duration` ms (default: 3000).
 *
 * @module store/toast
 */

import { create } from "zustand";

/** Tipos visuais de toast. */
export type ToastType = "success" | "error" | "info" | "warning";

/** Representa um toast individual na fila. */
export interface Toast {
    /** ID unico gerado automaticamente. */
    id: string;
    /** Mensagem exibida ao usuario. */
    message: string;
    /** Tipo visual (define cor e icone). */
    type: ToastType;
    /** Duracao em ms antes de auto-remover. Default: 3000. */
    duration?: number;
}

interface ToastStore {
    /** Fila de toasts ativos. */
    toasts: Toast[];
    /** Adiciona um toast a fila. Auto-remove apos `duration` ms. */
    addToast: (message: string, type: ToastType, duration?: number) => void;
    /** Remove um toast especifico pelo ID. */
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (message, type, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, message, type, duration };

        set((state) => ({
            toasts: [...state.toasts, toast],
        }));

        if (duration) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
