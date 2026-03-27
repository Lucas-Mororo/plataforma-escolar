from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsProfessor
from .models import Turma
from .serializers import TurmaSerializer, TurmaCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsProfessor])
def listar_criar_turma(request):
    """Lista ou cria turmas (professor/admin).

    GET  /turmas/
    POST /turmas/
    """
    if request.method == 'GET':
        qs = Turma.objects.all()
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(nome__icontains=search)
        return Response(TurmaSerializer(qs, many=True).data)

    serializer = TurmaCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def listar_turmas_publico(request):
    """Lista turmas sem autenticacao (para tela de registro).

    GET /turmas/publico/
    """
    return Response(TurmaSerializer(Turma.objects.all(), many=True).data)
