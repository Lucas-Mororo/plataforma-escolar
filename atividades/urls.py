from django.urls import path
from .views import (
    minhas_atividades, criar_atividade, respostas_atividade,
    admin_listar_atividades, admin_respostas_atividade,
)

urlpatterns = [
    path('me/atividades/', minhas_atividades),
    path('atividades/', criar_atividade),
    path('atividades/<int:atividade_id>/respostas/', respostas_atividade),
    path('gestao/atividades/', admin_listar_atividades),
    path('gestao/atividades/<int:atividade_id>/respostas/', admin_respostas_atividade),
]
