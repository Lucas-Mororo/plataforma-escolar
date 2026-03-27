import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import AdminLayout from "../../components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarUsuarios, toggleUsuario, criarUsuario } from "../../services/user.service";
import { buscarTurmas } from "../../services/resposta.service";
import { useToast } from "../../hooks/useToast";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import type { User } from "../../types/user";
import type { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TurmaMultiSelect from "@/components/TurmaMultiSelect";
import NativeSelect from "@/components/NativeSelect";
import SearchFilter from "@/components/SearchFilter";
import DataPagination from "@/components/DataPagination";

export default function AdminUsuarios() {
    const { success, error } = useToast();
    const qc = useQueryClient();

    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [role, setRole] = useQueryState("role", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;

    const { data, isLoading } = useQuery({ queryKey: ["usuarios", params], queryFn: () => listarUsuarios(params) });
    const { data: turmas = [] } = useQuery({ queryKey: ["turmas"], queryFn: buscarTurmas });
    const toggleMut = useMutation({ mutationFn: toggleUsuario, onSuccess: () => { success("Status atualizado!"); qc.invalidateQueries({ queryKey: ["usuarios"] }); }, onError: () => error("Erro ao atualizar") });
    const createMut = useMutation({
        mutationFn: criarUsuario,
        onSuccess: () => { success("Usuario criado!"); qc.invalidateQueries({ queryKey: ["usuarios"] }); },
        onError: (e: AxiosError) => { const d = e.response?.data as any; error(d?.username?.[0] || "Erro ao criar"); },
    });

    const usuarios = data?.results ?? [];
    const count = data?.count ?? 0;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div><h1 className="text-3xl font-bold">Usuarios</h1><p className="text-muted-foreground mt-1">Gerencie os usuarios do sistema</p></div>
                <Tabs defaultValue="list">
                    <TabsList><TabsTrigger value="list">Lista de Usuarios</TabsTrigger><TabsTrigger value="create">Criar Usuario</TabsTrigger></TabsList>
                    <TabsContent value="list" className="space-y-4">
                        <SearchFilter
                            search={search}
                            onSearchChange={(v) => { setSearch(v); setPage(1); }}
                            placeholder="Buscar por nome..."
                            selects={[
                                { key: "role", label: "Todas as funcoes", value: role, options: [{ value: "ALUNO", label: "Aluno" }, { value: "PROFESSOR", label: "Professor" }], onChange: (v) => { setRole(v); setPage(1); } },
                                { key: "status", label: "Todos os status", value: status, options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }], onChange: (v) => { setStatus(v); setPage(1); } },
                            ]}
                            onClear={() => { setSearch(""); setRole(""); setStatus(""); setPage(1); }}
                        />
                        <Card>
                            <CardHeader className="flex-row items-center gap-3 space-y-0">
                                <Users className="w-5 h-5 text-primary" /><CardTitle>Usuarios</CardTitle><Badge variant="secondary" className="ml-auto">{count}</Badge>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                                ) : !usuarios.length ? (
                                    <p className="text-center py-8 text-muted-foreground">Nenhum usuario encontrado</p>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Funcao</TableHead><TableHead>Turmas</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Acoes</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {usuarios.map((u: User) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell><p className="font-medium">{u.username}</p>{u.is_admin && <p className="text-xs text-primary">Administrador</p>}</TableCell>
                                                        <TableCell><Badge variant={u.role === "PROFESSOR" ? "default" : "secondary"}>{u.role === "PROFESSOR" ? "Professor" : "Aluno"}</Badge></TableCell>
                                                        <TableCell className="text-muted-foreground text-sm">{u.turmas?.map(t => t.nome).join(", ") || "-"}</TableCell>
                                                        <TableCell><Badge variant={u.is_active ? "default" : "destructive"} className="gap-1">{u.is_active ? <><UserCheck className="w-3 h-3" />Ativo</> : <><UserX className="w-3 h-3" />Inativo</>}</Badge></TableCell>
                                                        <TableCell className="text-right">{!u.is_admin && <Button variant="outline" size="sm" onClick={() => toggleMut.mutate(u.id)} disabled={toggleMut.isPending} className={u.is_active ? "text-destructive" : "text-green-500"}>{u.is_active ? "Desativar" : "Ativar"}</Button>}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <DataPagination count={count} page={page} pageSize={10} onPageChange={setPage} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="create">
                        <CreateUserForm turmas={turmas} onSubmit={(d) => createMut.mutate(d)} isLoading={createMut.isPending} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}

function CreateUserForm({ turmas, onSubmit, isLoading }: { turmas: any[]; onSubmit: (d: any) => void; isLoading: boolean }) {
    const [form, setForm] = useState({ username: "", password: "", role: "ALUNO" as "ALUNO" | "PROFESSOR", turma: [] as number[] });
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const validate = () => { const e: any = {}; if (!form.username.trim()) e.username = "Obrigatorio"; if (!form.password.trim()) e.password = "Obrigatorio"; if (form.role === "ALUNO" && !form.turma.length) e.turma = "Selecione uma turma"; setErrors(e); return !Object.keys(e).length; };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (validate()) { onSubmit(form); setForm({ username: "", password: "", role: "ALUNO", turma: [] }); } };

    return (
        <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0"><UserPlus className="w-5 h-5 text-primary" /><CardTitle>Criar Novo Usuario</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Nome de Usuario</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Usuario" className={errors.username ? "border-destructive" : ""} />{errors.username && <p className="text-destructive text-sm">{errors.username}</p>}</div>
                        <div className="space-y-2"><Label>Senha</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Senha" className={errors.password ? "border-destructive" : ""} />{errors.password && <p className="text-destructive text-sm">{errors.password}</p>}</div>
                    </div>
                    <div className="space-y-2"><Label>Funcao</Label><NativeSelect value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any, turma: [] })}><option value="ALUNO">Aluno</option><option value="PROFESSOR">Professor</option></NativeSelect></div>
                    {form.role === "ALUNO" && <div className="space-y-2"><Label>Turmas</Label><TurmaMultiSelect turmas={turmas} selected={form.turma} onChange={(ids) => { setForm({ ...form, turma: ids }); if (errors.turma) setErrors({ ...errors, turma: "" }); }} error={!!errors.turma} />{errors.turma && <p className="text-destructive text-sm">{errors.turma}</p>}</div>}
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Criando..." : "Criar Usuario"}</Button>
                </form>
            </CardContent>
        </Card>
    );
}
