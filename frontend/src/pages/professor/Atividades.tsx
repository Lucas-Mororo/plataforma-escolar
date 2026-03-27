import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import Layout from "../../components/Layout";
import { useAtividades } from "../../hooks/useAtividades";
import { BookOpen, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchFilter from "@/components/SearchFilter";
import DataPagination from "@/components/DataPagination";

export default function AtividadesProfessor() {
    const navigate = useNavigate();
    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (status) params.status = status;

    const { data, isLoading, error } = useAtividades(params);
    const atividades = data?.results ?? [];
    const count = data?.count ?? 0;
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    if (isLoading) return <Layout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div></Layout>;
    if (error) return <Layout><div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">Erro ao carregar atividades.</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div><h1 className="text-3xl font-bold">Minhas Atividades</h1><p className="text-muted-foreground mt-1">Veja todas as atividades e acesse as respostas.</p></div>
                <SearchFilter
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Buscar atividade..."
                    selects={[
                        { key: "status", label: "Todos os status", value: status, options: [{ value: "ativa", label: "Ativa" }, { value: "encerrada", label: "Encerrada" }], onChange: (v) => { setStatus(v); setPage(1); } },
                    ]}
                    onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
                />
                {!atividades.length ? (
                    <Card className="text-center py-12"><CardContent><BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Nenhuma atividade encontrada</p></CardContent></Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {atividades.map((a: any) => {
                                const enc = new Date(a.data_entrega) <= new Date();
                                return (
                                    <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/professor/atividade/${a.id}/respostas`)}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-base">{a.titulo}</CardTitle>
                                                <Badge variant={enc ? "secondary" : "default"}>{enc ? "Encerrada" : "Ativa"}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{a.descricao}</p>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Entrega: {fmt(a.data_entrega)}</p>
                                                <p className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Turmas: {a.turmas?.map((t: any) => t.nome).join(", ") || "-"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <DataPagination count={count} page={page} pageSize={10} onPageChange={setPage} />
                    </>
                )}
            </div>
        </Layout>
    );
}
