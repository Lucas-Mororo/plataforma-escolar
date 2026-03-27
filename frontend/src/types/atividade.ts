/**
 * Tipos relacionados a atividades.
 * @module types/atividade
 */

import type { Turma } from "./turma";

/** Representa uma atividade retornada pela API (leitura). */
export interface Atividade {
    /** Identificador unico. */
    id: number;
    /** Titulo da atividade. */
    titulo: string;
    /** Descricao/enunciado da atividade. */
    descricao: string;
    /** Data limite para envio de respostas (ISO 8601). */
    data_entrega: string;
    /** IDs das turmas associadas (usado em escrita). */
    turma: number[];
    /** Objetos turma serializados (leitura). */
    turmas: Turma[];
    /** ID do professor que criou a atividade. */
    professor: number;
    /** Username do professor (leitura). */
    professor_nome: string;
}

/** Payload para criacao de uma nova atividade (`POST /atividades/`). */
export interface AtividadeCreate {
    titulo: string;
    descricao: string;
    /** Data de entrega em formato ISO 8601. */
    data_entrega: string;
    /** IDs das turmas que terao acesso. */
    turma: number[];
}
