import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAtividades } from "../../hooks/useAtividades";
import { useQuery } from "@tanstack/react-query";
import { fetchMeStats } from "../../services/auth.service";
import { Plus, BookOpen, MessageSquare, Clock, TrendingUp, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardProfessor() {
    const { data, isLoading } = useAtividades({ page_size: "100" });
    const { data: stats } = useQuery({ queryKey: ["me-stats"], queryFn: fetchMeStats });
    const navigate = useNavigate();

    if (isLoading) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;

    const atividades = data?.results ?? [];
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const cards = [
        { label: "Total de Atividades", value: stats?.total_atividades ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Atividades Ativas", value: stats?.atividades_ativas ?? 0, icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Respostas Recebidas", value: stats?.respostas_recebidas ?? 0, icon: MessageSquare, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Taxa de Correcao", value: `${stats?.taxa_conclusao ?? 0}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div><h1 className="text-3xl font-bold">Dashboard Professor</h1><p className="text-muted-foreground mt-1">Gerencie suas atividades e acompanhe o progresso</p></div>
                    <Button onClick={() => navigate("/professor/atividades/criar")}><Plus className="w-4 h-4 mr-2" />Nova Atividade</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((s) => { const Icon = s.icon; return (
                        <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div></div></CardContent></Card>
                    ); })}
                </div>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Minhas Atividades</CardTitle><Button variant="link" className="p-0 h-auto" onClick={() => navigate("/professor/atividades")}>Ver todas →</Button></CardHeader>
                    <CardContent>
                        {!atividades.length ? (
                            <div className="text-center py-8"><BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Nenhuma atividade criada</p><p className="text-sm text-muted-foreground mt-1 mb-4">Comece criando sua primeira atividade.</p><Button onClick={() => navigate("/professor/atividades/criar")}>Criar Primeira Atividade</Button></div>
                        ) : (
                            <div className="space-y-2">
                                {atividades.slice(0, 5).map((a: any) => {
                                    const isAtiva = new Date(a.data_entrega) > new Date();
                                    return (
                                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/professor/atividade/${a.id}/respostas`)}>
                                            <div className="flex-1 min-w-0"><p className="font-medium truncate">{a.titulo}</p><div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(a.data_entrega)}</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{a.turmas?.map((t: any) => t.nome).join(", ") || "-"}</span></div></div>
                                            <Badge variant={isAtiva ? "default" : "secondary"}>{isAtiva ? "Ativa" : "Encerrada"}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
