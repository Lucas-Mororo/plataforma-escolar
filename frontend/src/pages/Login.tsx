import { useState, useEffect } from "react";
import { useLogin } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useToast } from "../hooks/useToast";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
    const { mutate, isPending } = useLogin();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const toast = useToast();

    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (user) {
            if (user.is_admin) navigate("/admin");
            else navigate(user.role === "ALUNO" ? "/aluno" : "/professor");
        }
    }, [user, navigate]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.username.trim()) newErrors.username = "Usuario obrigatorio";
        if (!form.password.trim()) newErrors.password = "Senha obrigatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Preencha todos os campos");
            return;
        }
        mutate(form);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/80 to-primary">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Plataforma Escolar</CardTitle>
                    <CardDescription>Entre na sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Nome de Usuario</Label>
                            <Input
                                id="username"
                                placeholder="Digite seu usuario"
                                value={form.username}
                                onChange={(e) => {
                                    setForm({ ...form, username: e.target.value });
                                    if (errors.username) setErrors({ ...errors, username: "" });
                                }}
                                disabled={isPending}
                                autoComplete="username"
                                className={errors.username ? "border-destructive" : ""}
                            />
                            {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={form.password}
                                onChange={(e) => {
                                    setForm({ ...form, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: "" });
                                }}
                                disabled={isPending}
                                autoComplete="current-password"
                                className={errors.password ? "border-destructive" : ""}
                            />
                            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : "Entrar"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Nao tem conta?{" "}
                        <button onClick={() => navigate("/registro")} className="text-primary font-semibold hover:underline">
                            Criar conta
                        </button>
                    </p>
                    <p className="text-xs text-muted-foreground">Sistema de gerenciamento educacional</p>
                </CardFooter>
            </Card>
        </div>
    );
}
