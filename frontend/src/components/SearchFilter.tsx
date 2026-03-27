/**
 * Componente reutilizavel de filtros com busca e selects.
 *
 * Combina um input de busca com debounce (400ms) e selects de filtro
 * em uma barra horizontal responsiva. Inclui botao para limpar todos
 * os filtros ativos.
 *
 * O input de busca mantem estado local para evitar perda de foco
 * durante a digitacao (o valor so e propagado apos o debounce).
 *
 * @module components/SearchFilter
 *
 * @example
 * ```tsx
 * <SearchFilter
 *   search={search}
 *   onSearchChange={(v) => { setSearch(v); setPage(1); }}
 *   placeholder="Buscar..."
 *   selects={[
 *     { key: "status", label: "Todos", value: status,
 *       options: [{ value: "ativo", label: "Ativo" }],
 *       onChange: (v) => setStatus(v) }
 *   ]}
 *   onClear={() => { setSearch(""); setStatus(""); }}
 * />
 * ```
 */

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NativeSelect from "@/components/NativeSelect";
import { useDebouncedCallback } from "@/hooks/useDebounce";

/** Opcao de um select de filtro. */
interface FilterOption {
    value: string;
    label: string;
}

/** Configuracao de um select de filtro. */
interface SelectFilter {
    /** Chave unica para o React key. */
    key: string;
    /** Label exibido como primeira opcao (placeholder). */
    label: string;
    /** Valor atual selecionado. */
    value: string;
    /** Opcoes disponiveis. */
    options: FilterOption[];
    /** Callback ao mudar selecao. */
    onChange: (value: string) => void;
}

interface SearchFilterProps {
    /** Valor atual da busca (controlado externamente via nuqs). */
    search: string;
    /** Callback ao mudar busca (chamado apos debounce de 400ms). */
    onSearchChange: (value: string) => void;
    /** Placeholder do input de busca. */
    placeholder?: string;
    /** Lista de selects de filtro. */
    selects?: SelectFilter[];
    /** Callback ao clicar em "limpar filtros". */
    onClear?: () => void;
}

export default function SearchFilter({ search, onSearchChange, placeholder = "Buscar...", selects = [], onClear }: SearchFilterProps) {
    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSearch = useDebouncedCallback(onSearchChange);

    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    const handleChange = (value: string) => {
        setLocalSearch(value);
        debouncedSearch(value);
    };

    const handleClear = () => {
        setLocalSearch("");
        if (onClear) onClear();
    };

    const hasFilters = localSearch || selects.some(s => s.value);

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={localSearch}
                    onChange={(e) => handleChange(e.target.value)}
                    className="pl-9"
                />
            </div>
            {selects.map((s) => (
                <NativeSelect key={s.key} value={s.value} onChange={(e) => s.onChange(e.target.value)} className="w-full sm:w-[180px]">
                    <option value="">{s.label}</option>
                    {s.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </NativeSelect>
            ))}
            {hasFilters && onClear && (
                <Button variant="ghost" size="icon" onClick={handleClear} title="Limpar filtros">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
