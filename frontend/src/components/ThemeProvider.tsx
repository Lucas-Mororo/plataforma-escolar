/**
 * Provider de tema claro/escuro.
 *
 * Observa o estado do `useThemeStore` e aplica/remove a classe CSS `dark`
 * no elemento `<html>`. O Tailwind CSS v4 usa `@custom-variant dark`
 * para ativar estilos dark mode via essa classe.
 *
 * @module components/ThemeProvider
 */

import { useEffect } from "react";
import { useThemeStore } from "../store/theme.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    return <>{children}</>;
}
