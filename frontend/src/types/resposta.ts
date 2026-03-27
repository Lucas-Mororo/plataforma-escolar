/**
 * Tipos relacionados a respostas de atividades.
 * @module types/resposta
 */

/** Representa uma resposta retornada pela API (leitura). */
export interface Resposta {
    /** Identificador unico. */
    id: number;
    /** ID da atividade respondida. */
    atividade: number;
    /** Titulo da atividade (leitura). */
    atividade_titulo: string;
    /** Conteudo textual da resposta do aluno. */
    texto: string;
    /** Nota atribuida pelo professor (0-10). `null` se pendente. */
    nota: number | null;
    /** Feedback do professor. `null` se nao informado. */
    feedback: string | null;
    /** ID do aluno que enviou. */
    aluno: number;
    /** Username do aluno (leitura). */
    aluno_nome: string;
    /** Data de envio (ISO 8601). */
    created_at?: string;
    /** Data da ultima atualizacao (ISO 8601). */
    updated_at?: string;
}

/** Payload para envio de nova resposta (`POST /respostas/`). */
export interface RespostaCreate {
    /** ID da atividade a ser respondida. */
    atividade: number;
    /** Texto da resposta. */
    texto: string;
}

/** Payload para correcao de resposta pelo professor (`PATCH /respostas/:id/`). */
export interface RespostaCorrecao {
    /** Nota entre 0 e 10. */
    nota: number;
    /** Feedback opcional do professor. */
    feedback?: string;
}
