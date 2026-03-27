from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg
from django.utils import timezone

from atividades.models import Atividade
from respostas.models import Resposta
from .models import User
from .serializers import (
    UserSerializer, UserMeSerializer, UserAdminSerializer, UserCreateSerializer,
)
from .pagination import paginate_queryset


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login customizado que retorna token + dados do usuario.

    POST /auth/login/
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            response.data['user'] = UserSerializer(serializer.user).data
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Retorna dados do usuario autenticado com is_admin server-verified.

    GET /auth/me/
    """
    return Response(UserMeSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_stats(request):
    """Estatisticas do dashboard por role.

    GET /auth/me/stats/
    """
    user = request.user
    now = timezone.now()

    if user.role == 'PROFESSOR' or user.is_superuser:
        atividades = Atividade.objects.filter(professor=user)
        respostas = Resposta.objects.filter(atividade__professor=user)
        total_respostas = respostas.count()
        corrigidas = respostas.filter(nota__isnull=False).count()

        return Response({
            "total_atividades": atividades.count(),
            "atividades_ativas": atividades.filter(data_entrega__gt=now).count(),
            "respostas_recebidas": total_respostas,
            "respostas_corrigidas": corrigidas,
            "taxa_conclusao": round((corrigidas / total_respostas * 100) if total_respostas > 0 else 0),
        })

    turmas_aluno = user.turma.all()
    atividades = Atividade.objects.filter(turma__in=turmas_aluno).distinct()
    media = Resposta.objects.filter(
        aluno=user, nota__isnull=False
    ).aggregate(media=Avg('nota'))['media']

    return Response({
        "total_atividades": atividades.count(),
        "respondidas": Resposta.objects.filter(aluno=user).count(),
        "corrigidas": Resposta.objects.filter(aluno=user, nota__isnull=False).count(),
        "pendentes": Resposta.objects.filter(aluno=user, nota__isnull=True).count(),
        "media_notas": round(media, 1) if media else None,
    })


@api_view(['POST'])
def criar_usuario(request):
    """Registro publico. Usuario inicia inativo.

    POST /usuarios/
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def listar_usuarios(request):
    """Lista usuarios com filtros e paginacao (admin only).

    GET /usuarios/lista/
    Query params: search, role, status, turma, page, page_size
    """
    qs = User.objects.all().order_by('-date_joined')

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(username__icontains=search)

    role = request.query_params.get('role', '').strip()
    if role in ('ALUNO', 'PROFESSOR'):
        qs = qs.filter(role=role)

    status = request.query_params.get('status', '').strip()
    if status == 'ativo':
        qs = qs.filter(is_active=True)
    elif status == 'inativo':
        qs = qs.filter(is_active=False)

    turma = request.query_params.get('turma', '').strip()
    if turma:
        qs = qs.filter(turma__id=turma)

    return paginate_queryset(request, qs, UserAdminSerializer)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_usuario(request, user_id):
    """Ativa/desativa usuario (admin only). Superusers nao podem ser desativados.

    PATCH /usuarios/<user_id>/toggle/
    """
    try:
        usuario = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"erro": "Usuario nao encontrado"}, status=404)

    if usuario.is_superuser:
        return Response({"erro": "Nao e possivel alterar status de um administrador"}, status=403)

    usuario.is_active = not usuario.is_active
    usuario.save()
    return Response(UserAdminSerializer(usuario).data)
