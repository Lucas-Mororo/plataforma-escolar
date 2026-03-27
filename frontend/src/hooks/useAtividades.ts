/**
 * Hooks do React Query para atividades, respostas e turmas.
 *
 * Encapsulam chamadas aos services com cache, invalidacao automatica
 * e notificacoes toast em caso de sucesso/erro.
 *
 * @module hooks/useAtividades
 */

import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAtividades,
    criarAtividade,
    getRespostasAtividade,
    enviarResposta,
    atualizarResposta,
    getMinhasRespostas,
} from "../services/atividade.service";
import { buscarTurmas } from "../services/resposta.service";
import type { RespostaCorrecao } from "../types/resposta";
import { useToast } from "./useToast";

/**
 * Lista atividades do usuario autenticado com filtros e paginacao.
 *
 * @param params - Query params enviados ao backend (search, status, turma, page, page_size).
 * @returns Query do React Query com `PaginatedResponse<Atividade>`.
 */
export const useAtividades = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ["atividades", params],
        queryFn: () => getAtividades(params),
    });
};

/**
 * Lista todas as turmas (requer autenticacao).
 *
 * @returns Query com lista de turmas (sem paginacao).
 */
export const useTurmas = () => {
    return useQuery({
        queryKey: ["turmas"],
        queryFn: buscarTurmas,
    });
};

/**
 * Mutation para criar uma nova atividade.
 *
 * Invalida o cache de atividades e exibe toast de sucesso/erro.
 *
 * @returns Mutation do React Query.
 */
export const useCriarAtividade = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: criarAtividade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["atividades"] });
            toast.success("Atividade criada com sucesso!");
        },
        onError: () => toast.error("Erro ao criar atividade"),
    });
};

/**
 * Lista respostas de uma atividade especifica com filtros.
 *
 * @param atividadeId - ID da atividade.
 * @param params - Query params (search, status, page, page_size).
 * @returns Query com `PaginatedResponse<Resposta>`.
 */
export const useRespostasAtividade = (atividadeId: number, params?: Record<string, string>) => {
    return useQuery({
        queryKey: ["respostas", atividadeId, params],
        queryFn: () => getRespostasAtividade(atividadeId, params),
    });
};

/**
 * Mutation para enviar uma resposta (aluno).
 *
 * Invalida caches de respostas e minhas-respostas.
 *
 * @returns Mutation do React Query.
 */
export const useEnviarResposta = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: enviarResposta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["respostas"] });
            queryClient.invalidateQueries({ queryKey: ["minhas-respostas"] });
            toast.success("Resposta enviada com sucesso!");
        },
        onError: (error: AxiosError) => {
            const message = (error.response?.data as { erro?: string })?.erro || "Erro ao enviar resposta";
            toast.error(message);
        },
    });
};

/**
 * Mutation para atualizar uma resposta.
 *
 * Usado tanto pelo aluno (editar texto) quanto pelo professor (corrigir).
 * Invalida caches de respostas e minhas-respostas.
 *
 * @returns Mutation do React Query.
 */
export const useAtualizarResposta = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> | RespostaCorrecao }) =>
            atualizarResposta(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["respostas"] });
            queryClient.invalidateQueries({ queryKey: ["minhas-respostas"] });
            toast.success("Resposta atualizada com sucesso!");
        },
        onError: (error: AxiosError) => {
            const message = (error.response?.data as { erro?: string })?.erro || "Erro ao atualizar resposta";
            toast.error(message);
        },
    });
};

/**
 * Lista respostas do aluno autenticado com filtros e paginacao.
 *
 * @param params - Query params (search, status, page, page_size).
 * @returns Query com `PaginatedResponse<Resposta>`.
 */
export const useMinhasRespostas = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ["minhas-respostas", params],
        queryFn: () => getMinhasRespostas(params),
    });
};
