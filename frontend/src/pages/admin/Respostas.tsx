import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import AdminLayout from "../../components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { adminGetTodasRespostas } from "../../services/admin.service";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchFilter from "@/components/SearchFilter";
import DataPagination from "@/components/DataPagination";
import type { Resposta } from "../../types/resposta";

export default function AdminRespostas() {
    const navigate = useNavigate();
    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (status) params.status = status;

    const { data, isLoading } = useQuery({ queryKey: ["admin-todas-respostas", params], queryFn: () => adminGetTodasRespostas(params) });
    const respostas = data?.results ?? [];
    const count = data?.count ?? 0;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div><h1 className="text-3xl font-bold">Respostas</h1><p className="text-muted-foreground mt-1">Todas as respostas do sistema</p></div>
                <SearchFilter
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Buscar por aluno ou atividade..."
                    selects={[
                        { key: "status", label: "Todos os status", value: status, options: [{ value: "corrigida", label: "Corrigida" }, { value: "pendente", label: "Pendente" }], onChange: (v) => { setStatus(v); setPage(1); } },
                    ]}
                    onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
                />
                <Card>
                    <CardHeader className="flex-row items-center gap-3 space-y-0"><MessageSquare className="w-5 h-5 text-primary" /><CardTitle>Respostas</CardTitle><Badge variant="secondary" className="ml-auto">{count}</Badge></CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                        ) : !respostas.length ? (
                            <p className="text-center py-8 text-muted-foreground">Nenhuma resposta encontrada</p>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Atividade</TableHead><TableHead>Resposta</TableHead><TableHead>Nota</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Acoes</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {respostas.map((r: Resposta) => (
                                            <TableRow key={r.id}>
                                                <TableCell className="font-medium">{r.aluno_nome}</TableCell>
                                                <TableCell className="text-sm">{r.atividade_titulo}</TableCell>
                                                <TableCell><p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{r.texto}</p></TableCell>
                                                <TableCell>{r.nota !== null ? <span className="font-bold text-primary">{r.nota}</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                                                <TableCell><Badge variant={r.nota !== null ? "default" : "secondary"}>{r.nota !== null ? "Corrigida" : "Pendente"}</Badge></TableCell>
                                                <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/admin/atividades/${r.atividade}/respostas`)}>Ver Atividade</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <DataPagination count={count} page={page} pageSize={10} onPageChange={setPage} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
