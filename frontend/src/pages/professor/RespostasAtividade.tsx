import { useParams, useNavigate } from "react-router-dom";
import { useQueryState, parseAsString } from "nuqs";
import Layout from "../../components/Layout";
import { useAtividades, useRespostasAtividade, useAtualizarResposta } from "../../hooks/useAtividades";
import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { useDebouncedCallback } from "../../hooks/useDebounce";
import type { Resposta } from "../../types/resposta";
import { ArrowLeft, Loader2, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NativeSelect from "@/components/NativeSelect";

export default function RespostasAtividade() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));

    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSetSearch = useDebouncedCallback((v: string) => { setSearch(v); });

    useEffect(() => { setLocalSearch(search); }, [search]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        debouncedSetSearch(value);
    };

    const params: Record<string, string> = { page_size: "100" };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    const { data: atvData, isLoading: la } = useAtividades({ page_size: "100" });
    const { data: respData, isLoading: lr } = useRespostasAtividade(parseInt(id || ""), params);
    const { mutate: atualizarResposta, isPending } = useAtualizarResposta();
    const [sel, setSel] = useState<Resposta | null>(null);
    const [nota, setNota] = useState("");
    const [feedback, setFeedback] = useState("");

    const atividades = atvData?.results ?? [];
    const respostas = respData?.results ?? [];
    const totalRespostas = respData?.count ?? 0;
    const atividade = atividades.find((a) => a.id === parseInt(id || ""));

    const handleCorrigir = () => {
        if (!sel) { toast.error("Selecione uma resposta"); return; }
        if (!nota) { toast.error("Atribua uma nota"); return; }
        const n = parseFloat(nota);
        if (n < 0 || n > 10) { toast.error("Nota entre 0 e 10"); return; }
        atualizarResposta({ id: sel.id, data: { nota: n, feedback } });
        setNota(""); setFeedback(""); setSel(null);
    };

    const handleClearFilters = () => {
        setLocalSearch("");
        setSearch("");
        setStatusFilter("");
    };

    const hasFilters = search || statusFilter;

    if (la || lr) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;
    if (!atividade) return <Layout><div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">Atividade nao encontrada</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/professor")}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
                <div>
                    <h1 className="text-2xl font-bold">{atividade.titulo}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{atividade.turmas?.map(t => t.nome).join(", ")} | {totalRespostas} respostas</p>
                </div>

                {!respostas.length && !hasFilters ? (
                    <Card className="text-center py-8"><CardContent><p className="text-muted-foreground">Nenhuma resposta recebida ainda</p></CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <h2 className="font-semibold">Respostas</h2>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar aluno..."
                                        value={localSearch}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-8 h-8 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <NativeSelect
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-8 text-xs flex-1"
                                    >
                                        <option value="">Todos</option>
                                        <option value="corrigida">Corrigidas</option>
                                        <option value="pendente">Pendentes</option>
                                    </NativeSelect>
                                    {hasFilters && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleClearFilters}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {respostas.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma resposta encontrada</p>
                            ) : (
                                <div className="space-y-2">
                                    {respostas.map((r) => (
                                        <button key={r.id} onClick={() => { setSel(r); setNota(r.nota?.toString() || ""); setFeedback(r.feedback || ""); }}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${sel?.id === r.id ? "border-primary bg-primary/5" : r.nota !== null ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                                            <p className="font-medium text-sm">{r.aluno_nome}</p>
                                            <Badge variant={r.nota !== null ? "default" : "secondary"} className="mt-1 text-xs">{r.nota !== null ? `Nota: ${r.nota}` : "Pendente"}</Badge>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {sel && (
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader><CardTitle>Resposta de {sel.aluno_nome}</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted rounded-lg p-4 min-h-[120px]"><p className="text-sm whitespace-pre-wrap">{sel.texto}</p></div>
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
        </Layout>
    );
}
