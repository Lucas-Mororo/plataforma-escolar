from rest_framework import serializers
from turmas.serializers import TurmaSerializer
from .models import Atividade


class AtividadeSerializer(serializers.ModelSerializer):
    turmas = TurmaSerializer(source='turma', many=True, read_only=True)
    professor_nome = serializers.CharField(source='professor.username', read_only=True)

    class Meta:
        model = Atividade
        fields = [
            'id', 'titulo', 'descricao', 'data_entrega',
            'turma', 'turmas', 'professor', 'professor_nome',
        ]
        read_only_fields = ['professor', 'turmas', 'professor_nome']

    def create(self, validated_data: dict) -> Atividade:
        user = self.context['request'].user
        turmas = validated_data.pop('turma', [])
        atividade = Atividade.objects.create(professor=user, **validated_data)
        atividade.turma.set(turmas)
        return atividade
