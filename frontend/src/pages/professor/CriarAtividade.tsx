import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useCriarAtividade, useTurmas } from "../../hooks/useAtividades";
import { useToast } from "../../hooks/useToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TurmaMultiSelect from "@/components/TurmaMultiSelect";

export default function CriarAtividade() {
    const navigate = useNavigate();
    const toast = useToast();
    const { mutate: criarAtividade, isPending } = useCriarAtividade();
    const { data: turmas = [], isLoading: carregandoTurmas } = useTurmas();
    const [form, setForm] = useState({ titulo: "", descricao: "", data_entrega: "", turma: [] as number[] });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const e: { [k: string]: string } = {};
        if (!form.titulo.trim()) e.titulo = "Titulo obrigatorio";
        if (!form.descricao.trim()) e.descricao = "Descricao obrigatoria";
        if (!form.data_entrega) e.data_entrega = "Data obrigatoria";
        if (!form.turma.length) e.turma = "Selecione pelo menos uma turma";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) { toast.error("Preencha todos os campos"); return; }
        criarAtividade({ titulo: form.titulo, descricao: form.descricao, data_entrega: new Date(form.data_entrega).toISOString(), turma: form.turma });
        setTimeout(() => navigate("/professor"), 1000);
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/professor")}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
                <Card>
                    <CardHeader><CardTitle className="text-2xl">Criar Nova Atividade</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Titulo</Label>
                                <Input placeholder="Titulo da atividade" value={form.titulo} onChange={(e) => { setForm({ ...form, titulo: e.target.value }); if (errors.titulo) setErrors({ ...errors, titulo: "" }); }} disabled={isPending} className={errors.titulo ? "border-destructive" : ""} />
                                {errors.titulo && <p className="text-destructive text-sm">{errors.titulo}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Descricao</Label>
                                <Textarea placeholder="Descricao da atividade" value={form.descricao} onChange={(e) => { setForm({ ...form, descricao: e.target.value }); if (errors.descricao) setErrors({ ...errors, descricao: "" }); }} disabled={isPending} className={`min-h-[120px] ${errors.descricao ? "border-destructive" : ""}`} />
                                {errors.descricao && <p className="text-destructive text-sm">{errors.descricao}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Entrega</Label>
                                <Input type="datetime-local" value={form.data_entrega} onChange={(e) => { setForm({ ...form, data_entrega: e.target.value }); if (errors.data_entrega) setErrors({ ...errors, data_entrega: "" }); }} disabled={isPending} className={errors.data_entrega ? "border-destructive" : ""} />
                                {errors.data_entrega && <p className="text-destructive text-sm">{errors.data_entrega}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Turmas</Label>
                                <TurmaMultiSelect
                                    turmas={turmas}
                                    selected={form.turma}
                                    onChange={(ids) => { setForm({ ...form, turma: ids }); if (errors.turma) setErrors({ ...errors, turma: "" }); }}
                                    disabled={isPending || carregandoTurmas}
                                    error={!!errors.turma}
                                />
                                {errors.turma && <p className="text-destructive text-sm">{errors.turma}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : "Criar Atividade"}</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/professor")}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
