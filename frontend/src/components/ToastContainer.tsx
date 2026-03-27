/**
 * Container de notificacoes toast.
 *
 * Renderiza a fila de toasts do `useToastStore` no canto superior direito
 * da tela. Cada toast exibe icone, mensagem e botao de fechar.
 *
 * Cores por tipo:
 * - success: verde
 * - error: vermelho
 * - info: azul
 * - warning: amarelo
 *
 * @module components/ToastContainer
 */

import { useToastStore } from "../store/toast.store";

export default function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    const bgColors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
    };

    const icons = {
        success: "\u2713",
        error: "\u2715",
        info: "\u2139",
        warning: "\u26A0",
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${bgColors[toast.type]} text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 animate-pulse`}
                >
                    <span className="text-xl">{icons[toast.type]}</span>
                    <span>{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-4 text-xl hover:opacity-70"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
