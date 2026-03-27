from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from accounts.permissions import IsAluno
from accounts.pagination import paginate_queryset
from .models import Resposta
from .serializers import RespostaSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAluno])
def enviar_resposta(request):
    """Envia resposta para uma atividade (aluno/admin).

    POST /respostas/
    """
    serializer = RespostaSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAluno])
def minhas_respostas(request):
    """Lista respostas do aluno autenticado.

    GET /me/respostas/
    Query params: search, status, page, page_size
    """
    qs = Resposta.objects.filter(aluno=request.user).order_by('-created_at')

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(atividade__titulo__icontains=search)

    status = request.query_params.get('status', '').strip()
    if status == 'corrigida':
        qs = qs.filter(nota__isnull=False)
    elif status == 'pendente':
        qs = qs.filter(nota__isnull=True)

    return paginate_queryset(request, qs, RespostaSerializer)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def atualizar_resposta(request, resposta_id):
    """Edita resposta (aluno) ou corrige (professor/admin).

    PATCH /respostas/<id>/
    """
    try:
        resposta = Resposta.objects.get(id=resposta_id)
    except Resposta.DoesNotExist:
        return Response({"erro": "Resposta nao encontrada"}, status=404)

    user = request.user

    if user.role == 'ALUNO':
        if resposta.aluno != user:
            return Response({"erro": "Voce nao pode editar essa resposta"}, status=403)
        if timezone.now() > resposta.atividade.data_entrega:
            return Response({"erro": "Prazo expirado"}, status=400)
        texto = request.data.get('texto')
        if texto:
            resposta.texto = texto
            resposta.save()
            return Response({"mensagem": "Resposta atualizada"})
        return Response({"erro": "Texto obrigatorio"}, status=400)

    elif user.role == 'PROFESSOR' or user.is_superuser:
        if not user.is_superuser and resposta.atividade.professor != user:
            return Response({"erro": "Voce nao pode corrigir essa atividade"}, status=403)
        nota = request.data.get('nota')
        feedback = request.data.get('feedback')
        if nota is None:
            return Response({"erro": "Nota obrigatoria"}, status=400)
        try:
            nota = float(nota)
        except (ValueError, TypeError):
            return Response({"erro": "Nota invalida"}, status=400)
        if nota < 0 or nota > 10:
            return Response({"erro": "Nota deve estar entre 0 e 10"}, status=400)
        resposta.nota = nota
        resposta.feedback = feedback
        resposta.save()
        return Response({"mensagem": "Resposta corrigida"})

    return Response({"erro": "Tipo de usuario invalido"}, status=400)


# ============================================================
# ADMIN (GESTAO)
# ============================================================


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_todas_respostas(request):
    """Lista TODAS as respostas (admin only).

    GET /gestao/respostas/
    Query params: search, status, atividade, page, page_size
    """
    qs = Resposta.objects.all().order_by('-created_at')

    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(
            Q(aluno__username__icontains=search) |
            Q(atividade__titulo__icontains=search)
        )

    status = request.query_params.get('status', '').strip()
    if status == 'corrigida':
        qs = qs.filter(nota__isnull=False)
    elif status == 'pendente':
        qs = qs.filter(nota__isnull=True)

    atividade = request.query_params.get('atividade', '').strip()
    if atividade:
        qs = qs.filter(atividade__id=atividade)

    return paginate_queryset(request, qs, RespostaSerializer)
