import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import Layout from "../../components/Layout";
import { useMinhasRespostas } from "../../hooks/useAtividades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchFilter from "@/components/SearchFilter";
import DataPagination from "@/components/DataPagination";

export default function MinhasRespostas() {
    const navigate = useNavigate();
    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (status) params.status = status;

    const { data, isLoading } = useMinhasRespostas(params);
    const respostas = data?.results ?? [];
    const count = data?.count ?? 0;

    if (isLoading) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Minhas Respostas</h1>
                <SearchFilter
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Buscar por atividade..."
                    selects={[
                        { key: "status", label: "Todos os status", value: status, options: [{ value: "corrigida", label: "Corrigida" }, { value: "pendente", label: "Pendente" }], onChange: (v) => { setStatus(v); setPage(1); } },
                    ]}
                    onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
                />
                {!respostas.length ? (
                    <Card className="text-center py-8"><CardContent><p className="text-muted-foreground">Nenhuma resposta encontrada</p></CardContent></Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {respostas.map((r) => (
                                <Card key={r.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{r.atividade_titulo}</CardTitle>
                                            <Badge variant={r.nota !== null ? "default" : "secondary"}>{r.nota !== null ? `Nota: ${r.nota}` : "Pendente"}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="bg-muted rounded-lg p-3"><p className="text-sm">{r.texto}</p></div>
                                        {r.nota !== null && r.feedback && (
                                            <div className="bg-primary/5 rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Feedback</p><p className="text-sm">{r.feedback}</p></div>
                                        )}
                                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/aluno/atividade/${r.atividade}`)}>Ver Atividade →</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <DataPagination count={count} page={page} pageSize={10} onPageChange={setPage} />
                    </>
                )}
            </div>
        </Layout>
    );
}
