/**
 * Schemas de validacao Zod para todos os formularios.
 * @module schemas/forms
 */

import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "Email obrigatorio").email("Email invalido"),
    password: z.string().min(1, "Senha obrigatoria"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        username: z.string().min(3, "Minimo 3 caracteres").max(50, "Maximo 50 caracteres"),
        email: z.string().min(1, "Email obrigatorio").email("Email invalido"),
        password: z.string().min(6, "Minimo 6 caracteres"),
        confirmPassword: z.string().min(1, "Confirme a senha"),
        role: z.enum(["ALUNO", "PROFESSOR"]),
        turma: z.array(z.number()),
    })
    .refine((data) => data.password === data.confirmPassword, { message: "Senhas nao conferem", path: ["confirmPassword"] })
    .refine((data) => data.role !== "ALUNO" || data.turma.length > 0, { message: "Selecione pelo menos uma turma", path: ["turma"] });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const criarAtividadeSchema = z.object({
    titulo: z.string().min(1, "Titulo obrigatorio").max(255, "Maximo 255 caracteres"),
    descricao: z.string().min(1, "Descricao obrigatoria"),
    data_entrega: z.string().min(1, "Data de entrega obrigatoria"),
    turma: z.array(z.number()).min(1, "Selecione pelo menos uma turma"),
});
export type CriarAtividadeFormData = z.infer<typeof criarAtividadeSchema>;

export const criarUsuarioSchema = z.object({
    username: z.string().min(3, "Minimo 3 caracteres"),
    password: z.string().min(6, "Minimo 6 caracteres"),
    role: z.enum(["ALUNO", "PROFESSOR"]),
    turma: z.array(z.number()),
});
export type CriarUsuarioFormData = z.infer<typeof criarUsuarioSchema>;

export const correcaoSchema = z.object({
    nota: z.number({ required_error: "Nota obrigatoria" }).min(0, "Nota minima: 0").max(10, "Nota maxima: 10"),
    feedback: z.string().optional(),
});
export type CorrecaoFormData = z.infer<typeof correcaoSchema>;
