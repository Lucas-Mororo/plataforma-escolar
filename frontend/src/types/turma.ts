/**
 * Tipos relacionados a turmas.
 * @module types/turma
 */

/** Representa uma turma/classe no sistema. */
export interface Turma {
    /** Identificador unico da turma. */
    id: number;
    /** Nome da turma (ex: "1 Ano A"). */
    nome: string;
}
