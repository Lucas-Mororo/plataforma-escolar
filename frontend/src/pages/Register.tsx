import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { registrarUsuario } from "../services/user.service";
import { buscarTurmasPublico } from "../services/resposta.service";
import { useAuthStore } from "../store/auth.store";
import { useToast } from "../hooks/useToast";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import TurmaMultiSelect from "@/components/TurmaMultiSelect";
import NativeSelect from "@/components/NativeSelect";
import type { AxiosError } from "axios";

export default function Register() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const toast = useToast();

    const [form, setForm] = useState({
        username: "", password: "", confirmPassword: "",
        role: "ALUNO" as "ALUNO" | "PROFESSOR",
        turma: [] as number[],
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { data: turmas = [] } = useQuery({
        queryKey: ["turmas-publicas"],
        queryFn: buscarTurmasPublico,
        enabled: form.role === "ALUNO",
    });

    const { mutate, isPending } = useMutation({
        mutationFn: registrarUsuario,
        onSuccess: () => {
            toast.success("Conta criada! Aguarde ativacao por um administrador.");
            navigate("/login");
        },
        onError: (err: AxiosError) => {
            const data = err.response?.data as Record<string, string[]>;
            if (data?.username) setErrors({ username: data.username[0] });
            else toast.error("Erro ao criar conta.");
        },
    });

    useEffect(() => {
        if (user) navigate(user.role === "ALUNO" ? "/aluno" : "/professor");
    }, [user, navigate]);

    const validateForm = () => {
        const e: { [key: string]: string } = {};
        if (!form.username.trim() || form.username.length < 3) e.username = "Minimo 3 caracteres";
        if (!form.password.trim() || form.password.length < 6) e.password = "Minimo 6 caracteres";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas nao conferem";
        if (form.role === "ALUNO" && form.turma.length === 0) e.turma = "Selecione pelo menos uma turma";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        mutate({ username: form.username, password: form.password, role: form.role, turma: form.role === "ALUNO" ? form.turma : [] });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/80 to-primary">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Criar Conta</CardTitle>
                    <CardDescription>Preencha os dados para se cadastrar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome de Usuario</Label>
                            <Input placeholder="Digite seu usuario" value={form.username}
                                onChange={(e) => { setForm({ ...form, username: e.target.value }); if (errors.username) setErrors({ ...errors, username: "" }); }}
                                disabled={isPending} className={errors.username ? "border-destructive" : ""} />
                            {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input type="password" placeholder="Minimo 6 caracteres" value={form.password}
                                onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: "" }); }}
                                disabled={isPending} className={errors.password ? "border-destructive" : ""} />
                            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar Senha</Label>
                            <Input type="password" placeholder="Repita a senha" value={form.confirmPassword}
                                onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }}
                                disabled={isPending} className={errors.confirmPassword ? "border-destructive" : ""} />
                            {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Conta</Label>
                            <NativeSelect
                                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "ALUNO" | "PROFESSOR", turma: [] })} disabled={isPending}>
                                <option value="ALUNO">Aluno</option>
                                <option value="PROFESSOR">Professor</option>
                            </NativeSelect>
                        </div>
                        {form.role === "ALUNO" && (
                            <div className="space-y-2">
                                <Label>Turmas</Label>
                                <TurmaMultiSelect
                                    turmas={turmas}
                                    selected={form.turma}
                                    onChange={(ids) => { setForm({ ...form, turma: ids }); if (errors.turma) setErrors({ ...errors, turma: "" }); }}
                                    disabled={isPending}
                                    error={!!errors.turma}
                                    placeholder="Selecione suas turmas..."
                                />
                                {errors.turma && <p className="text-destructive text-sm">{errors.turma}</p>}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : "Criar Conta"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Ja tem conta?{" "}
                        <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Entrar</button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
