import { useState, useEffect } from "react";
import { useLogin } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { GraduationCap, Loader2, BookOpen, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
    const { mutate, isPending } = useLogin();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        if (user) {
            if (user.is_admin) navigate("/admin");
            else navigate(user.role === "ALUNO" ? "/aluno" : "/professor");
        }
    }, [user, navigate]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.email.trim()) newErrors.email = "Email obrigatorio";
        if (!form.password.trim()) newErrors.password = "Senha obrigatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        if (!validateForm()) return;
        mutate(form, {
            onError: (error: any) => {
                const status = error?.response?.status;
                const data = error?.response?.data;
                if (status === 401) {
                    setLoginError("Email ou senha incorretos");
                } else if (data?.detail) {
                    setLoginError(data.detail);
                } else {
                    setLoginError("Erro ao conectar. Tente novamente.");
                }
                setForm((prev) => ({ ...prev, password: "" }));
            },
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold">Plataforma Escolar</span>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold leading-tight">
                                Gerencie suas<br />atividades escolares<br />em um so lugar
                            </h1>
                            <p className="mt-4 text-lg text-white/70 max-w-md">
                                Professores criam atividades, alunos enviam respostas e acompanham suas notas de forma simples e organizada.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: BookOpen, label: "Atividades", desc: "Crie e gerencie" },
                                { icon: Users, label: "Turmas", desc: "Organize alunos" },
                                { icon: Award, label: "Notas", desc: "Correcao rapida" },
                            ].map((item) => (
                                <div key={item.label} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                                    <item.icon className="w-6 h-6 mb-2 text-white/80" />
                                    <p className="font-semibold text-sm">{item.label}</p>
                                    <p className="text-xs text-white/60">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-white/40">Sistema de gerenciamento educacional</p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold">Plataforma Escolar</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h2>
                        <p className="text-muted-foreground">Entre com suas credenciais para acessar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {loginError && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-destructive text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm text-destructive">{loginError}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={(e) => { setForm({ ...form, email: e.target.value }); setLoginError(""); if (errors.email) setErrors({ ...errors, email: "" }); }}
                                disabled={isPending}
                                autoComplete="email"
                                className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                            />
                            {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={form.password}
                                onChange={(e) => { setForm({ ...form, password: e.target.value }); setLoginError(""); if (errors.password) setErrors({ ...errors, password: "" }); }}
                                disabled={isPending}
                                autoComplete="current-password"
                                className={`h-11 ${errors.password ? "border-destructive" : ""}`}
                            />
                            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : "Entrar"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Nao tem uma conta?{" "}
                        <button onClick={() => navigate("/registro")} className="text-primary font-semibold hover:underline">
                            Criar conta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
