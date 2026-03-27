/**
 * Tipo generico para respostas paginadas da API.
 *
 * Todas as listagens com paginacao retornam este formato.
 * Corresponde ao `PageNumberPagination` do Django REST Framework.
 *
 * @module types/pagination
 * @template T - Tipo dos itens na lista `results`.
 *
 * @example
 * ```ts
 * const response: PaginatedResponse<Atividade> = {
 *   count: 42,
 *   next: "http://api/me/atividades/?page=3",
 *   previous: "http://api/me/atividades/?page=1",
 *   results: [{ id: 1, titulo: "..." }, ...]
 * };
 * ```
 */
export interface PaginatedResponse<T> {
    /** Total de itens no banco (sem paginacao). */
    count: number;
    /** URL da proxima pagina. `null` se for a ultima. */
    next: string | null;
    /** URL da pagina anterior. `null` se for a primeira. */
    previous: string | null;
    /** Itens da pagina atual. */
    results: T[];
}
