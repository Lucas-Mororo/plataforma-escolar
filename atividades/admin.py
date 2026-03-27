from django.contrib import admin
from .models import Atividade


@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'professor', 'get_turmas', 'data_entrega', 'created_at')
    list_filter = ('professor', 'data_entrega')
    search_fields = ('titulo', 'descricao')

    def get_turmas(self, obj: Atividade) -> str:
        return ", ".join([t.nome for t in obj.turma.all()])
    get_turmas.short_description = 'Turmas'
