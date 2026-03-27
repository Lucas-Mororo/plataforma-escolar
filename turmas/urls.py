from django.urls import path
from .views import listar_criar_turma, listar_turmas_publico

urlpatterns = [
    path('turmas/', listar_criar_turma),
    path('turmas/publico/', listar_turmas_publico),
]
