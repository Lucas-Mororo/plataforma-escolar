/**
 * Select nativo estilizado com suporte a dark mode.
 *
 * Wrapper sobre o `<select>` HTML nativo com estilos consistentes
 * com o design system (shadcn). Resolve o problema de `<option>`
 * ficarem invisiveis no dark mode usando `bg-background` e
 * `[&>option]:bg-popover`.
 *
 * @module components/NativeSelect
 *
 * @example
 * ```tsx
 * <NativeSelect value={role} onChange={(e) => setRole(e.target.value)}>
 *   <option value="ALUNO">Aluno</option>
 *   <option value="PROFESSOR">Professor</option>
 * </NativeSelect>
 * ```
 */

import { cn } from "@/lib/utils";

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export default function NativeSelect({ className, children, ...props }: NativeSelectProps) {
    return (
        <select
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "[&>option]:bg-popover [&>option]:text-popover-foreground",
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}
