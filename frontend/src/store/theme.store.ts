/**
 * Store de tema claro/escuro (Zustand + persist).
 *
 * Persiste a preferencia do usuario no `localStorage` sob a chave
 * `theme-storage`. O `ThemeProvider` aplica a classe CSS `dark` no
 * `<html>` baseado neste estado.
 *
 * @module store/theme
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
    /** Tema atual: "light" ou "dark". */
    theme: Theme;
    /** Alterna entre light e dark. */
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: "light",
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "light" ? "dark" : "light",
                })),
        }),
        {
            name: "theme-storage",
        }
    )
);
