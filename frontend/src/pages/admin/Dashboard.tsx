import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "../../services/user.service";
import { buscarTurmas } from "../../services/resposta.service";
import { adminGetAtividades, adminGetTodasRespostas } from "../../services/admin.service";
import { Users, GraduationCap, UserX, BookOpen, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "../../types/user";
import type { Atividade } from "../../types/atividade";
import type { Resposta } from "../../types/resposta";

export default function AdminDashboard() {
    const { data: usersData } = useQuery({ queryKey: ["usuarios", { page_size: "100" }], queryFn: () => listarUsuarios({ page_size: "100" }) });
    const { data: turmas = [] } = useQuery({ queryKey: ["turmas"], queryFn: buscarTurmas });
    const { data: atvData } = useQuery({ queryKey: ["admin-atividades", { page_size: "100" }], queryFn: () => adminGetAtividades({ page_size: "100" }) });
    const { data: respData } = useQuery({ queryKey: ["admin-todas-respostas", { page_size: "100" }], queryFn: () => adminGetTodasRespostas({ page_size: "100" }) });
    const navigate = useNavigate();

    const usuarios = usersData?.results ?? [];
    const atividades = atvData?.results ?? [];
    const respostas = respData?.results ?? [];
    const inativos = usuarios.filter((u: User) => !u.is_active);
    const pendentes = respostas.filter((r: Resposta) => r.nota === null);

    const stats = [
        { label: "Usuarios", value: usersData?.count ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", path: "/admin/usuarios" },
        { label: "Turmas", value: turmas.length, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10", path: "/admin/turmas" },
        { label: "Atividades", value: atvData?.count ?? 0, icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10", path: "/admin/atividades" },
        { label: "Respostas", value: respData?.count ?? 0, icon: MessageSquare, color: "text-yellow-500", bg: "bg-yellow-500/10", path: "/admin/respostas" },
    ];

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div><h1 className="text-3xl font-bold">Painel Administrativo</h1><p className="text-muted-foreground mt-1">Visao geral do sistema</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => { const Icon = s.icon; return (
                        <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.path)}>
                            <CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div></div></CardContent>
                        </Card>
                    ); })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base flex items-center gap-2"><UserX className="w-4 h-4 text-destructive" />Aguardando Ativacao</CardTitle><Badge variant={inativos.length > 0 ? "destructive" : "secondary"}>{inativos.length}</Badge></CardHeader>
                        <CardContent>
                            {!inativos.length ? <p className="text-sm text-muted-foreground py-2">Nenhum usuario pendente</p> : (
                                <div className="space-y-2">
                                    {inativos.slice(0, 5).map((u: User) => (
                                        <div key={u.id} className="flex items-center justify-between p-2 rounded-lg border text-sm"><div><p className="font-medium">{u.username}</p><p className="text-xs text-muted-foreground">{u.role === "PROFESSOR" ? "Professor" : "Aluno"}</p></div><Badge variant="secondary">Inativo</Badge></div>
                                    ))}
                                    {inativos.length > 5 && <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/admin/usuarios?status=inativo")}>Ver todos ({inativos.length})</Button>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4 text-yellow-500" />Respostas Pendentes</CardTitle><Badge variant={pendentes.length > 0 ? "default" : "secondary"}>{pendentes.length}</Badge></CardHeader>
                        <CardContent>
                            {!pendentes.length ? <p className="text-sm text-muted-foreground py-2">Todas corrigidas</p> : (
                                <div className="space-y-2">
                                    {pendentes.slice(0, 5).map((r: Resposta) => (
                                        <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border text-sm"><div><p className="font-medium">{r.aluno_nome}</p><p className="text-xs text-muted-foreground">{r.atividade_titulo}</p></div><Badge variant="secondary">Pendente</Badge></div>
                                    ))}
                                    {pendentes.length > 5 && <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/admin/respostas?status=pendente")}>Ver todas ({pendentes.length})</Button>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {atividades.length > 0 && (
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Atividades Recentes</CardTitle><Button variant="link" className="p-0 h-auto" onClick={() => navigate("/admin/atividades")}>Ver todas</Button></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {atividades.slice(0, 5).map((a: Atividade) => {
                                    const enc = new Date(a.data_entrega) <= new Date();
                                    return (
                                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/atividades/${a.id}/respostas`)}>
                                            <div className="flex-1 min-w-0"><p className="font-medium truncate">{a.titulo}</p><p className="text-xs text-muted-foreground">{a.professor_nome} | {a.turmas?.map(t => t.nome).join(", ") || "-"}</p></div>
                                            <Badge variant={enc ? "secondary" : "default"}>{enc ? "Encerrada" : "Ativa"}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
