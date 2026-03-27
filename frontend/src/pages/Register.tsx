import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { registerSchema } from "@/schemas/forms";
import { registrarUsuario } from "../services/user.service";
import { buscarTurmasPublico } from "../services/resposta.service";
import { useAuthStore } from "../store/auth.store";
import { useToast } from "../hooks/useToast";
import { Loader2, UserPlus, GraduationCap, ShieldCheck, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TurmaMultiSelect from "@/components/TurmaMultiSelect";
import NativeSelect from "@/components/NativeSelect";
import type { AxiosError } from "axios";

export default function Register() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const toast = useToast();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate, isPending } = useMutation({
        mutationFn: registrarUsuario,
        onSuccess: () => { toast.success("Conta criada! Aguarde ativacao por um administrador."); navigate("/login"); },
        onError: (err: AxiosError) => {
            const data = err.response?.data as Record<string, string[]>;
            if (data?.username) setFieldErrors((p) => ({ ...p, username: data.username[0] }));
            if (data?.email) setFieldErrors((p) => ({ ...p, email: data.email[0] }));
            if (!data?.username && !data?.email) toast.error("Erro ao criar conta.");
        },
    });

    const form = useForm({
        defaultValues: { username: "", email: "", password: "", confirmPassword: "", role: "ALUNO" as "ALUNO" | "PROFESSOR", turma: [] as number[] },
        onSubmit: ({ value }) => {
            const result = registerSchema.safeParse(value);
            if (!result.success) {
                const errs: Record<string, string> = {};
                result.error.errors.forEach((e) => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
                setFieldErrors(errs);
                return;
            }
            setFieldErrors({});
            mutate({ username: value.username, email: value.email, password: value.password, role: value.role, turma: value.role === "ALUNO" ? value.turma : [] });
        },
    });

    const roleValue = form.getFieldValue("role");

    const { data: turmas = [] } = useQuery({
        queryKey: ["turmas-publicas"],
        queryFn: buscarTurmasPublico,
        enabled: roleValue === "ALUNO",
    });

    useEffect(() => { if (user) navigate(user.role === "ALUNO" ? "/aluno" : "/professor"); }, [user, navigate]);

    const clearError = (name: string) => setFieldErrors((p) => ({ ...p, [name]: "" }));

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><GraduationCap className="w-6 h-6" /></div>
                        <span className="text-xl font-bold">Plataforma Escolar</span>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold leading-tight">Junte-se a nossa<br />plataforma de<br />ensino</h1>
                            <p className="mt-4 text-lg text-white/70 max-w-md">Crie sua conta e comece a acompanhar suas atividades, notas e feedbacks em tempo real.</p>
                        </div>
                        <div className="space-y-3">
                            {[{ icon: ShieldCheck, text: "Conta segura com aprovacao do administrador" }, { icon: Clock, text: "Acompanhe prazos e entregas em tempo real" }, { icon: BookOpen, text: "Acesse atividades e feedbacks dos professores" }].map((item) => (
                                <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                    <item.icon className="w-5 h-5 text-white/80 shrink-0" /><p className="text-sm text-white/80">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-white/40">Sistema de gerenciamento educacional</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
                <div className="w-full max-w-sm space-y-6 py-8">
                    <div className="lg:hidden flex items-center gap-3 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><UserPlus className="w-6 h-6 text-primary" /></div>
                        <span className="text-xl font-bold">Criar Conta</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Criar sua conta</h2>
                        <p className="text-muted-foreground">Preencha os dados para se cadastrar</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
                        <form.Field name="username">{(field) => (
                            <div className="space-y-2">
                                <Label>Nome de Usuario</Label>
                                <Input placeholder="Digite seu usuario" value={field.state.value}
                                    onChange={(e) => { field.handleChange(e.target.value); clearError("username"); }}
                                    onBlur={field.handleBlur} disabled={isPending}
                                    className={`h-11 ${fieldErrors.username ? "border-destructive" : ""}`} />
                                {fieldErrors.username && <p className="text-destructive text-sm">{fieldErrors.username}</p>}
                            </div>
                        )}</form.Field>

                        <form.Field name="email">{(field) => (
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="seu@email.com" value={field.state.value}
                                    onChange={(e) => { field.handleChange(e.target.value); clearError("email"); }}
                                    onBlur={field.handleBlur} disabled={isPending}
                                    className={`h-11 ${fieldErrors.email ? "border-destructive" : ""}`} />
                                {fieldErrors.email && <p className="text-destructive text-sm">{fieldErrors.email}</p>}
                            </div>
                        )}</form.Field>

                        <div className="grid grid-cols-2 gap-3">
                            <form.Field name="password">{(field) => (
                                <div className="space-y-2">
                                    <Label>Senha</Label>
                                    <Input type="password" placeholder="Min. 6 chars" value={field.state.value}
                                        onChange={(e) => { field.handleChange(e.target.value); clearError("password"); }}
                                        onBlur={field.handleBlur} disabled={isPending}
                                        className={`h-11 ${fieldErrors.password ? "border-destructive" : ""}`} />
                                    {fieldErrors.password && <p className="text-destructive text-sm">{fieldErrors.password}</p>}
                                </div>
                            )}</form.Field>
                            <form.Field name="confirmPassword">{(field) => (
                                <div className="space-y-2">
                                    <Label>Confirmar</Label>
                                    <Input type="password" placeholder="Repita" value={field.state.value}
                                        onChange={(e) => { field.handleChange(e.target.value); clearError("confirmPassword"); }}
                                        onBlur={field.handleBlur} disabled={isPending}
                                        className={`h-11 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`} />
                                    {fieldErrors.confirmPassword && <p className="text-destructive text-sm">{fieldErrors.confirmPassword}</p>}
                                </div>
                            )}</form.Field>
                        </div>

                        <form.Field name="role">{(field) => (
                            <div className="space-y-2">
                                <Label>Tipo de Conta</Label>
                                <NativeSelect className="h-11" value={field.state.value}
                                    onChange={(e) => { field.handleChange(e.target.value as "ALUNO" | "PROFESSOR"); form.setFieldValue("turma", []); }}
                                    disabled={isPending}>
                                    <option value="ALUNO">Aluno</option><option value="PROFESSOR">Professor</option>
                                </NativeSelect>
                            </div>
                        )}</form.Field>

                        {roleValue === "ALUNO" && (
                            <form.Field name="turma">{(field) => (
                                <div className="space-y-2">
                                    <Label>Turmas</Label>
                                    <TurmaMultiSelect turmas={turmas} selected={field.state.value}
                                        onChange={(ids) => { field.handleChange(ids); clearError("turma"); }}
                                        disabled={isPending} error={!!fieldErrors.turma} placeholder="Selecione suas turmas..." />
                                    {fieldErrors.turma && <p className="text-destructive text-sm">{fieldErrors.turma}</p>}
                                </div>
                            )}</form.Field>
                        )}

                        <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : "Criar Conta"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        Ja tem uma conta?{" "}<button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Entrar</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
