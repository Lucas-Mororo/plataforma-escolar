import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useCriarAtividade, useTurmas } from "../../hooks/useAtividades";
import { useForm } from "@tanstack/react-form";
import { criarAtividadeSchema } from "@/schemas/forms";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TurmaMultiSelect from "@/components/TurmaMultiSelect";

export default function AdminCriarAtividade() {
    const navigate = useNavigate();
    const { mutate: criarAtividade, isPending } = useCriarAtividade();
    const { data: turmas = [], isLoading: carregandoTurmas } = useTurmas();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const form = useForm({
        defaultValues: { titulo: "", descricao: "", data_entrega: "", turma: [] as number[] },
        onSubmit: ({ value }) => {
            const result = criarAtividadeSchema.safeParse(value);
            if (!result.success) {
                const errs: Record<string, string> = {};
                result.error.errors.forEach((e) => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
                setFieldErrors(errs);
                return;
            }
            setFieldErrors({});
            criarAtividade({ titulo: value.titulo, descricao: value.descricao, data_entrega: new Date(value.data_entrega).toISOString(), turma: value.turma });
            setTimeout(() => navigate("/admin/atividades"), 1000);
        },
    });

    const clearError = (name: string) => setFieldErrors((p) => ({ ...p, [name]: "" }));

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/atividades")}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
                <Card>
                    <CardHeader><CardTitle className="text-2xl">Criar Nova Atividade</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
                            <form.Field name="titulo">{(field) => (
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input placeholder="Título da atividade" value={field.state.value}
                                        onChange={(e) => { field.handleChange(e.target.value); clearError("titulo"); }}
                                        onBlur={field.handleBlur} disabled={isPending}
                                        className={fieldErrors.titulo ? "border-destructive" : ""} />
                                    {fieldErrors.titulo && <p className="text-destructive text-sm">{fieldErrors.titulo}</p>}
                                </div>
                            )}</form.Field>

                            <form.Field name="descricao">{(field) => (
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea placeholder="Descrição da atividade" value={field.state.value}
                                        onChange={(e) => { field.handleChange(e.target.value); clearError("descricao"); }}
                                        onBlur={field.handleBlur} disabled={isPending}
                                        className={`min-h-[120px] ${fieldErrors.descricao ? "border-destructive" : ""}`} />
                                    {fieldErrors.descricao && <p className="text-destructive text-sm">{fieldErrors.descricao}</p>}
                                </div>
                            )}</form.Field>

                            <form.Field name="data_entrega">{(field) => (
                                <div className="space-y-2">
                                    <Label>Data de Entrega</Label>
                                    <Input type="datetime-local" value={field.state.value}
                                        onChange={(e) => { field.handleChange(e.target.value); clearError("data_entrega"); }}
                                        onBlur={field.handleBlur} disabled={isPending}
                                        className={fieldErrors.data_entrega ? "border-destructive" : ""} />
                                    {fieldErrors.data_entrega && <p className="text-destructive text-sm">{fieldErrors.data_entrega}</p>}
                                </div>
                            )}</form.Field>

                            <form.Field name="turma">{(field) => (
                                <div className="space-y-2">
                                    <Label>Turmas</Label>
                                    <TurmaMultiSelect turmas={turmas} selected={field.state.value}
                                        onChange={(ids) => { field.handleChange(ids); clearError("turma"); }}
                                        disabled={isPending || carregandoTurmas} error={!!fieldErrors.turma} />
                                    {fieldErrors.turma && <p className="text-destructive text-sm">{fieldErrors.turma}</p>}
                                </div>
                            )}</form.Field>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" className="flex-1" disabled={isPending}>
                                    {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : "Criar Atividade"}
                                </Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/admin/atividades")}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
