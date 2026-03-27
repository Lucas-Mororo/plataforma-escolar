from django.contrib import admin
from .models import Resposta


@admin.register(Resposta)
class RespostaAdmin(admin.ModelAdmin):
    list_display = ('id', 'atividade', 'aluno', 'nota', 'created_at', 'updated_at')
    list_filter = ('nota',)
    search_fields = ('aluno__username', 'atividade__titulo')
