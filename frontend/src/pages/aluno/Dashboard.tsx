import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAtividades } from "../../hooks/useAtividades";
import { useQuery } from "@tanstack/react-query";
import { fetchMeStats } from "../../services/auth.service";
import type { Atividade } from "../../types/atividade";
import { Clock, CheckCircle, BookOpen, Calendar, User, MessageSquare, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardAluno() {
    const { data, isLoading, error } = useAtividades({ page_size: "100" });
    const { data: stats } = useQuery({ queryKey: ["me-stats"], queryFn: fetchMeStats });
    const navigate = useNavigate();

    if (isLoading) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;
    if (error) return <Layout><div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">Erro ao carregar atividades.</div></Layout>;

    const atividades = data?.results ?? [];
    const proximas = atividades.filter((a: Atividade) => new Date(a.data_entrega) > new Date());
    const passadas = atividades.filter((a: Atividade) => new Date(a.data_entrega) <= new Date());
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const cards = [
        { label: "Atividades Disponiveis", value: stats?.total_atividades ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Respondidas", value: stats?.respondidas ?? 0, icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Aguardando Correcao", value: stats?.pendentes ?? 0, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Media de Notas", value: stats?.media_notas != null ? stats.media_notas : "-", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    const Section = ({ title, icon: Icon, items, muted }: { title: string; icon: any; items: Atividade[]; muted?: boolean }) => (
        <div>
            <div className="flex items-center gap-3 mb-4"><Icon className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">{title}</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((a) => (
                    <Card key={a.id} className={`cursor-pointer hover:shadow-md transition-shadow group ${muted ? "opacity-70 hover:opacity-100" : ""}`} onClick={() => navigate(`/aluno/atividade/${a.id}`)}>
                        <CardHeader className="pb-2"><CardTitle className="text-base group-hover:text-primary transition-colors">{a.titulo}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">{a.descricao}</p>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{a.professor_nome}</p>
                                <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Entrega: {fmt(a.data_entrega)}</p>
                            </div>
                            <Button size="sm" variant={muted ? "outline" : "default"} className="w-full">Ver Detalhes</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div><h1 className="text-3xl font-bold">Minhas Atividades</h1><p className="text-muted-foreground mt-1">Acompanhe suas atividades escolares</p></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((s) => { const Icon = s.icon; return (
                        <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div></div></CardContent></Card>
                    ); })}
                </div>

                {!atividades.length ? (
                    <Card className="text-center py-12"><CardContent><BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Nenhuma atividade disponivel</p><p className="text-sm text-muted-foreground mt-1">Suas atividades aparecerao aqui.</p></CardContent></Card>
                ) : (
                    <>
                        {proximas.length > 0 && <Section title="Em Andamento" icon={Clock} items={proximas} />}
                        {passadas.length > 0 && <Section title="Encerradas" icon={CheckCircle} items={passadas} muted />}
                    </>
                )}
            </div>
        </Layout>
    );
}
