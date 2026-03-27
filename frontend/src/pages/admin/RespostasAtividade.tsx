import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAtividades, adminGetRespostasAtividade } from "../../services/admin.service";
import { atualizarResposta } from "../../services/atividade.service";
import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import type { Resposta, RespostaCorrecao } from "../../types/resposta";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AdminRespostasAtividade() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const qc = useQueryClient();

    const { data: atvData } = useQuery({
        queryKey: ["admin-atividades", { page_size: "100" }],
        queryFn: () => adminGetAtividades({ page_size: "100" }),
    });
    const { data: respData, isLoading } = useQuery({
        queryKey: ["admin-respostas", id],
        queryFn: () => adminGetRespostasAtividade(parseInt(id || ""), { page_size: "100" }),
        enabled: !!id,
    });

    const { mutate: corrigir, isPending } = useMutation({
        mutationFn: ({ respostaId, data }: { respostaId: number; data: RespostaCorrecao }) =>
            atualizarResposta(respostaId, data),
        onSuccess: () => {
            toast.success("Correcao salva!");
            qc.invalidateQueries({ queryKey: ["admin-respostas", id] });
            setSel(null);
        },
        onError: () => toast.error("Erro ao salvar correcao"),
    });

    const [sel, setSel] = useState<Resposta | null>(null);
    const [nota, setNota] = useState("");
    const [feedback, setFeedback] = useState("");

    const atividades = atvData?.results ?? [];
    const respostas = respData?.results ?? [];
    const atividade = atividades.find((a) => a.id === parseInt(id || ""));
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const handleCorrigir = () => {
        if (!sel || !nota) return;
        const n = parseFloat(nota);
        if (n < 0 || n > 10) { toast.error("Nota entre 0 e 10"); return; }
        corrigir({ respostaId: sel.id, data: { nota: n, feedback: feedback || undefined } });
    };

    const corrigidas = respostas.filter((r: Resposta) => r.nota !== null);
    const pendentes = respostas.filter((r: Resposta) => r.nota === null);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/atividades")}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>

                {atividade && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{atividade.titulo}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Professor: {atividade.professor_nome} | Turmas: {atividade.turmas?.map(t => t.nome).join(", ") || "-"} | Entrega: {fmt(atividade.data_entrega)}
                                    </p>
                                </div>
                                <Badge variant={new Date(atividade.data_entrega) <= new Date() ? "secondary" : "default"}>
                                    {new Date(atividade.data_entrega) <= new Date() ? "Encerrada" : "Ativa"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">{atividade.descricao}</p></CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{respostas.length}</p></CardContent></Card>
                    <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Corrigidas</p><p className="text-2xl font-bold text-green-500">{corrigidas.length}</p></CardContent></Card>
                    <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-destructive">{pendentes.length}</p></CardContent></Card>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : !respostas.length ? (
                    <Card className="text-center py-8"><CardContent><p className="text-muted-foreground">Nenhuma resposta recebida</p></CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h2 className="font-semibold mb-2">Respostas ({respostas.length})</h2>
                            {respostas.map((r: Resposta) => (
                                <button key={r.id} onClick={() => { setSel(r); setNota(r.nota?.toString() || ""); setFeedback(r.feedback || ""); }}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${sel?.id === r.id ? "border-primary bg-primary/5" : r.nota !== null ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                                    <p className="font-medium text-sm">{r.aluno_nome}</p>
                                    <Badge variant={r.nota !== null ? "default" : "secondary"} className="mt-1 text-xs">{r.nota !== null ? `Nota: ${r.nota}` : "Pendente"}</Badge>
                                </button>
                            ))}
                        </div>
                        {sel && (
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader><CardTitle>Resposta de {sel.aluno_nome}</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted rounded-lg p-4 min-h-[100px]"><p className="text-sm whitespace-pre-wrap">{sel.texto}</p></div>
                                        <Separator />
                                        <div className="space-y-2"><Label>Nota (0-10)</Label><Input type="number" min="0" max="10" step="0.5" placeholder="Nota" value={nota} onChange={(e) => setNota(e.target.value)} disabled={isPending} /></div>
                                        <div className="space-y-2"><Label>Feedback</Label><Textarea placeholder="Feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} disabled={isPending} className="min-h-[80px]" /></div>
                                        <Button className="w-full" disabled={isPending || !nota} onClick={handleCorrigir}>
                                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : "Salvar Correcao"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
