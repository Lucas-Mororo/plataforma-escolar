from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from accounts.permissions import IsProfessor
from accounts.pagination import paginate_queryset
from respostas.serializers import RespostaSerializer
from .models import Atividade
from .serializers import AtividadeSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minhas_atividades(request):
    """Lista atividades do usuario autenticado.

    GET /me/atividades/
    Query params: search, status, turma, page, page_size
    """
    user = request.user
    if user.role == 'PROFESSOR':
        qs = Atividade.objects.filter(professor=user)
    else:
        qs = Atividade.objects.filter(turma__in=user.turma.all()).distinct()

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(Q(titulo__icontains=search) | Q(descricao__icontains=search))

    status = request.query_params.get('status', '').strip()
    now = timezone.now()
    if status == 'ativa':
        qs = qs.filter(data_entrega__gt=now)
    elif status == 'encerrada':
        qs = qs.filter(data_entrega__lte=now)

    turma = request.query_params.get('turma', '').strip()
    if turma:
        qs = qs.filter(turma__id=turma)

    return paginate_queryset(request, qs.order_by('-created_at'), AtividadeSerializer)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsProfessor])
def criar_atividade(request):
    """Cria uma nova atividade (professor/admin).

    POST /atividades/
    """
    serializer = AtividadeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsProfessor])
def respostas_atividade(request, atividade_id):
    """Respostas de uma atividade do professor.

    GET /atividades/<id>/respostas/
    Query params: search, status, page, page_size
    """
    try:
        atividade = Atividade.objects.get(id=atividade_id)
    except Atividade.DoesNotExist:
        return Response({"erro": "Atividade nao encontrada"}, status=404)

    if atividade.professor != request.user and not request.user.is_superuser:
        return Response({"erro": "Acesso negado"}, status=403)

    qs = atividade.respostas.all()

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(aluno__username__icontains=search)

    status = request.query_params.get('status', '').strip()
    if status == 'corrigida':
        qs = qs.filter(nota__isnull=False)
    elif status == 'pendente':
        qs = qs.filter(nota__isnull=True)

    return paginate_queryset(request, qs, RespostaSerializer)


# ============================================================
# ADMIN (GESTAO)
# ============================================================


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_listar_atividades(request):
    """Lista TODAS as atividades (admin only).

    GET /gestao/atividades/
    Query params: search, status, professor, turma, page, page_size
    """
    qs = Atividade.objects.all().order_by('-created_at')

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(Q(titulo__icontains=search) | Q(descricao__icontains=search))

    status = request.query_params.get('status', '').strip()
    now = timezone.now()
    if status == 'ativa':
        qs = qs.filter(data_entrega__gt=now)
    elif status == 'encerrada':
        qs = qs.filter(data_entrega__lte=now)

    professor = request.query_params.get('professor', '').strip()
    if professor:
        qs = qs.filter(professor__id=professor)

    turma = request.query_params.get('turma', '').strip()
    if turma:
        qs = qs.filter(turma__id=turma)

    return paginate_queryset(request, qs, AtividadeSerializer)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_respostas_atividade(request, atividade_id):
    """Respostas de qualquer atividade (admin only).

    GET /gestao/atividades/<id>/respostas/
    Query params: status, page, page_size
    """
    try:
        atividade = Atividade.objects.get(id=atividade_id)
    except Atividade.DoesNotExist:
        return Response({"erro": "Atividade nao encontrada"}, status=404)

    qs = atividade.respostas.all()

    status = request.query_params.get('status', '').strip()
    if status == 'corrigida':
        qs = qs.filter(nota__isnull=False)
    elif status == 'pendente':
        qs = qs.filter(nota__isnull=True)

    return paginate_queryset(request, qs, RespostaSerializer)
