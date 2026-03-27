import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import AdminLayout from "../../components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { adminGetAtividades } from "../../services/admin.service";
import { Calendar, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchFilter from "@/components/SearchFilter";
import DataPagination from "@/components/DataPagination";
import type { Atividade } from "../../types/atividade";

export default function AdminAtividades() {
    const navigate = useNavigate();
    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (status) params.status = status;

    const { data, isLoading } = useQuery({ queryKey: ["admin-atividades", params], queryFn: () => adminGetAtividades(params) });
    const atividades = data?.results ?? [];
    const count = data?.count ?? 0;
    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div><h1 className="text-3xl font-bold">Atividades</h1><p className="text-muted-foreground mt-1">Todas as atividades do sistema</p></div>
                <SearchFilter
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Buscar por titulo..."
                    selects={[
                        { key: "status", label: "Todos os status", value: status, options: [{ value: "ativa", label: "Ativa" }, { value: "encerrada", label: "Encerrada" }], onChange: (v) => { setStatus(v); setPage(1); } },
                    ]}
                    onClear={() => { setSearch(""); setStatus(""); setPage(1); }}
                />
                <Card>
                    <CardHeader><CardTitle>Atividades</CardTitle></CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                        ) : !atividades.length ? (
                            <p className="text-center py-8 text-muted-foreground">Nenhuma atividade encontrada</p>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Titulo</TableHead><TableHead>Professor</TableHead><TableHead>Turmas</TableHead><TableHead>Entrega</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Acoes</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {atividades.map((a: Atividade) => {
                                            const enc = new Date(a.data_entrega) <= new Date();
                                            return (
                                                <TableRow key={a.id}>
                                                    <TableCell><p className="font-medium">{a.titulo}</p><p className="text-xs text-muted-foreground line-clamp-1">{a.descricao}</p></TableCell>
                                                    <TableCell><span className="flex items-center gap-1 text-sm"><User className="w-3.5 h-3.5" />{a.professor_nome}</span></TableCell>
                                                    <TableCell><span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-3.5 h-3.5" />{a.turmas?.map(t => t.nome).join(", ") || "-"}</span></TableCell>
                                                    <TableCell className="text-sm"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmt(a.data_entrega)}</span></TableCell>
                                                    <TableCell><Badge variant={enc ? "secondary" : "default"}>{enc ? "Encerrada" : "Ativa"}</Badge></TableCell>
                                                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => navigate(`/admin/atividades/${a.id}/respostas`)}>Ver Respostas</Button></TableCell>
                                                </TableRow>
                                            );
                                        })}
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
