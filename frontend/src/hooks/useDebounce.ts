/**
 * Hook de debounce para callbacks.
 *
 * Retorna uma funcao que atrasa a execucao do callback ate que o usuario
 * pare de chamar por `delay` ms. Usado nos filtros de busca para evitar
 * requests a cada keystroke.
 *
 * @module hooks/useDebounce
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback((value) => setSearch(value), 400);
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */

import { useEffect, useRef } from "react";

/**
 * Cria uma funcao debounced que atrasa a execucao do callback.
 *
 * @param callback - Funcao a ser executada apos o delay.
 * @param delay - Tempo de espera em ms (default: 400).
 * @returns Funcao debounced que aceita um valor string.
 */
export function useDebouncedCallback(callback: (value: string) => void, delay = 400) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debounced = (value: string) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => callback(value), delay);
    };

    useEffect(() => {
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, []);

    return debounced;
}
