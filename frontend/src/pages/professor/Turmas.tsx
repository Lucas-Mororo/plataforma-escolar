import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import type { Turma } from "../../types/turma";
import { buscarTurmas, criarTurma } from "../../services/resposta.service";
import { useToast } from "../../hooks/useToast";
import type { AxiosError } from "axios";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Turmas() {
    const queryClient = useQueryClient();
    const { success, error } = useToast();
    const [nomeTurma, setNomeTurma] = useState("");
    const { data: turmas = [], isLoading } = useQuery({ queryKey: ["turmas"], queryFn: buscarTurmas });
    const mutation = useMutation({
        mutationFn: criarTurma,
        onSuccess: () => { success("Turma criada!"); setNomeTurma(""); queryClient.invalidateQueries({ queryKey: ["turmas"] }); },
        onError: (err: AxiosError) => { error((err.response?.data as any)?.message || "Erro ao criar turma"); },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomeTurma.trim()) { error("Preencha o nome"); return; }
        mutation.mutate(nomeTurma);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div><h1 className="text-3xl font-bold">Turmas</h1><p className="text-muted-foreground mt-1">Gerencie as turmas do sistema</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Criar Nova Turma</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2"><Label>Nome da Turma</Label><Input placeholder="Ex: 1 Ano A" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} disabled={mutation.isPending} /></div>
                                <Button type="submit" className="w-full" disabled={mutation.isPending}><Plus className="w-4 h-4 mr-2" />Criar Turma</Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <CardHeader><CardTitle>Turmas Cadastradas ({turmas.length})</CardTitle></CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? <p className="p-6 text-center text-muted-foreground">Carregando...</p>
                                : !turmas.length ? <p className="p-6 text-center text-muted-foreground">Nenhuma turma cadastrada</p>
                                : turmas.map((t: Turma, i: number) => (
                                    <div key={t.id} className={`flex items-center justify-between px-6 py-3 hover:bg-accent/50 transition-colors ${i < turmas.length - 1 ? "border-b" : ""}`}>
                                        <div><p className="font-medium">{t.nome}</p><p className="text-xs text-muted-foreground">ID: {t.id}</p></div>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
