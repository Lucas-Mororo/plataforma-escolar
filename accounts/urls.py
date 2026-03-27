from django.urls import path
from .views import (
    CustomTokenObtainPairView, me, me_stats,
    criar_usuario, listar_usuarios, toggle_usuario,
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/me/', me),
    path('auth/me/stats/', me_stats),
    path('usuarios/', criar_usuario),
    path('usuarios/lista/', listar_usuarios),
    path('usuarios/<int:user_id>/toggle/', toggle_usuario),
]
