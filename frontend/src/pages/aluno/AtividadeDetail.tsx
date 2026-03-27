import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAtividades, useEnviarResposta, useMinhasRespostas, useAtualizarResposta } from "../../hooks/useAtividades";
import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { ArrowLeft, Loader2, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AtividadeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { data: atvData, isLoading } = useAtividades({ page_size: "100" });
    const { data: respData } = useMinhasRespostas({ page_size: "100" });
    const { mutate: enviarResposta, isPending: enviando } = useEnviarResposta();
    const { mutate: atualizarResposta, isPending: atualizando } = useAtualizarResposta();

    const [texto, setTexto] = useState("");
    const [editando, setEditando] = useState(false);
    const [textoEditado, setTextoEditado] = useState("");

    const atividades = atvData?.results ?? [];
    const minhasRespostas = respData?.results ?? [];
    const atividade = atividades.find((a) => a.id === parseInt(id || ""));
    const minhaResposta = minhasRespostas.find((r) => r.atividade === parseInt(id || ""));
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const expirado = new Date(atividade?.data_entrega || "") < new Date();

    useEffect(() => {
        if (minhaResposta && editando) {
            setTextoEditado(minhaResposta.texto);
        }
    }, [editando, minhaResposta]);

    const handleEnviar = () => {
        if (!texto.trim()) { toast.error("Escreva sua resposta"); return; }
        enviarResposta({ atividade: parseInt(id || ""), texto });
        setTexto("");
    };

    const handleAtualizar = () => {
        if (!minhaResposta || !textoEditado.trim()) { toast.error("Escreva sua resposta"); return; }
        atualizarResposta(
            { id: minhaResposta.id, data: { texto: textoEditado } },
            { onSuccess: () => setEditando(false) }
        );
    };

    if (isLoading) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;
    if (!atividade) return <Layout><div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">Atividade nao encontrada</div></Layout>;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/aluno/atividades")}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <CardTitle className="text-2xl">{atividade.titulo}</CardTitle>
                            <Badge variant={expirado ? "destructive" : "default"}>{expirado ? "Expirado" : "Em Andamento"}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-muted-foreground">Professor</p><p className="font-medium">{atividade.professor_nome}</p></div>
                            <div><p className="text-muted-foreground">Turmas</p><p className="font-medium">{atividade.turmas?.map(t => t.nome).join(", ") || "-"}</p></div>
                            <div><p className="text-muted-foreground">Entrega</p><p className={`font-medium ${expirado ? "text-destructive" : "text-green-500"}`}>{fmt(atividade.data_entrega)}</p></div>
                        </div>
                        <Separator />
                        <div><p className="text-sm font-medium mb-2">Descricao</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{atividade.descricao}</p></div>
                    </CardContent>
                </Card>

                {minhaResposta ? (
                    <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-green-600 dark:text-green-400">Sua Resposta</CardTitle>
                                {!expirado && !editando && (
                                    <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
                                        <Pencil className="w-3.5 h-3.5 mr-1.5" />Editar
                                    </Button>
                                )}
                                {editando && (
                                    <Button variant="ghost" size="sm" onClick={() => setEditando(false)}>
                                        <X className="w-3.5 h-3.5 mr-1.5" />Cancelar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editando ? (
                                <>
                                    <Textarea
                                        value={textoEditado}
                                        onChange={(e) => setTextoEditado(e.target.value)}
                                        disabled={atualizando}
                                        className="min-h-[180px]"
                                    />
                                    <Button className="w-full" disabled={atualizando || !textoEditado.trim()} onClick={handleAtualizar}>
                                        {atualizando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Salvar Alteracao"}
                                    </Button>
                                </>
                            ) : (
                                <Card><CardContent className="pt-4"><p className="text-sm whitespace-pre-wrap">{minhaResposta.texto}</p></CardContent></Card>
                            )}

                            {minhaResposta.nota !== null && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Nota</p><p className="text-3xl font-bold text-primary">{minhaResposta.nota}</p></CardContent></Card>
                                    {minhaResposta.feedback && <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Feedback</p><p className="text-sm">{minhaResposta.feedback}</p></CardContent></Card>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Enviar Resposta</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {expirado && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">O prazo para enviar resposta ja expirou</div>}
                            <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} disabled={expirado || enviando} placeholder="Digite sua resposta aqui..." className="min-h-[180px]" />
                            <Button className="w-full" disabled={expirado || enviando || !texto.trim()} onClick={handleEnviar}>
                                {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Enviar Resposta"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
