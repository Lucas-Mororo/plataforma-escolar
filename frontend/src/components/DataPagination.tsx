/**
 * Componente de paginacao reutilizavel.
 *
 * Exibe botoes de navegacao (anterior, paginas numeradas, proximo)
 * e contagem total de resultados. Usa ellipsis (...) para ranges grandes.
 *
 * Nao renderiza nada se houver apenas 1 pagina.
 *
 * @module components/DataPagination
 *
 * @example
 * ```tsx
 * <DataPagination
 *   count={42}
 *   page={currentPage}
 *   pageSize={10}
 *   onPageChange={(p) => setPage(p)}
 * />
 * ```
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataPaginationProps {
    /** Total de itens (vem do `count` da resposta paginada). */
    count: number;
    /** Pagina atual (1-indexed). */
    page: number;
    /** Itens por pagina (deve corresponder ao `page_size` da API). */
    pageSize: number;
    /** Callback chamado ao clicar em uma pagina. */
    onPageChange: (page: number) => void;
}

export default function DataPagination({ count, page, pageSize, onPageChange }: DataPaginationProps) {
    const totalPages = Math.ceil(count / pageSize);
    if (totalPages <= 1) return null;

    // Gera array de paginas com ellipsis: [1, 2, 3, "...", 10]
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    return (
        <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
                {count} {count === 1 ? "resultado" : "resultados"}
            </p>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                        <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onPageChange(p)}>
                            {p}
                        </Button>
                    )
                )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
