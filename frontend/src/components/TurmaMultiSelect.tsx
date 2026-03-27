/**
 * Componente de selecao multipla de turmas com checkboxes.
 *
 * Exibe um botao trigger que mostra as turmas selecionadas como badges.
 * Ao clicar, abre um dropdown (via portal) com checkboxes para cada turma.
 *
 * Funcionalidades:
 * - Selecao/desselecao individual via checkbox.
 * - Remocao individual via botao X no badge.
 * - Botao "Limpar selecao" no rodape do dropdown.
 * - Fecha ao clicar fora (click outside).
 * - Dropdown renderizado via `createPortal` para evitar corte por
 *   `overflow: hidden` de containers pai (ex: Card do shadcn).
 * - Posicao calculada dinamicamente e atualizada em scroll/resize.
 *
 * @module components/TurmaMultiSelect
 *
 * @example
 * ```tsx
 * <TurmaMultiSelect
 *   turmas={turmas}
 *   selected={form.turma}
 *   onChange={(ids) => setForm({ ...form, turma: ids })}
 *   placeholder="Selecione turmas..."
 *   error={!!errors.turma}
 * />
 * ```
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Turma } from "@/types/turma";

interface TurmaMultiSelectProps {
    /** Lista de turmas disponiveis para selecao. */
    turmas: Turma[];
    /** IDs das turmas atualmente selecionadas. */
    selected: number[];
    /** Callback ao mudar selecao. Recebe array de IDs. */
    onChange: (ids: number[]) => void;
    /** Desabilita o componente. */
    disabled?: boolean;
    /** Exibe borda vermelha de erro. */
    error?: boolean;
    /** Texto exibido quando nenhuma turma esta selecionada. */
    placeholder?: string;
}

export default function TurmaMultiSelect({ turmas, selected, onChange, disabled, error, placeholder = "Selecionar turmas..." }: TurmaMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    /** Recalcula posicao do dropdown baseado no trigger. */
    const updatePos = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
    }, []);

    // Atualiza posicao em scroll e resize
    useEffect(() => {
        if (open) {
            updatePos();
            window.addEventListener("scroll", updatePos, true);
            window.addEventListener("resize", updatePos);
            return () => {
                window.removeEventListener("scroll", updatePos, true);
                window.removeEventListener("resize", updatePos);
            };
        }
    }, [open, updatePos]);

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /** Alterna selecao de uma turma. */
    const toggle = (id: number) => {
        onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
    };

    const selectedTurmas = turmas.filter(t => selected.includes(t.id));

    return (
        <>
            {/* Trigger button */}
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "min-h-9 h-auto",
                    !selected.length && "text-muted-foreground",
                    error ? "border-destructive" : "border-input",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                    {selectedTurmas.length > 0 ? (
                        selectedTurmas.map(t => (
                            <Badge key={t.id} variant="secondary" className="gap-1 text-xs">
                                {t.nome}
                                <span
                                    role="button"
                                    className="ml-0.5 rounded-full hover:bg-foreground/20 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); toggle(t.id); }}
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            </Badge>
                        ))
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </div>
                <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50 ml-2" />
            </button>

            {/* Dropdown via portal (evita overflow:hidden do Card) */}
            {open && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                >
                    {turmas.length === 0 ? (
                        <div className="p-3 text-sm text-center text-muted-foreground">Nenhuma turma disponivel</div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto p-1">
                            {turmas.map(t => {
                                const isSelected = selected.includes(t.id);
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggle(t.id)}
                                        className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                                    >
                                        <div className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-sm border shrink-0",
                                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                                        )}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                        {t.nome}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {selected.length > 0 && (
                        <>
                            <div className="border-t" />
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="w-full p-2 text-xs text-center text-muted-foreground hover:text-foreground"
                            >
                                Limpar selecao
                            </button>
                        </>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
