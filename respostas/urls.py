from django.urls import path
from .views import enviar_resposta, minhas_respostas, atualizar_resposta, admin_todas_respostas

urlpatterns = [
    path('respostas/', enviar_resposta),
    path('me/respostas/', minhas_respostas),
    path('respostas/<int:resposta_id>/', atualizar_resposta),
    path('gestao/respostas/', admin_todas_respostas),
]
