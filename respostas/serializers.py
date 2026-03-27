from rest_framework import serializers
from .models import Resposta


class RespostaSerializer(serializers.ModelSerializer):
    atividade_titulo = serializers.CharField(source='atividade.titulo', read_only=True)
    aluno_nome = serializers.CharField(source='aluno.username', read_only=True)

    class Meta:
        model = Resposta
        fields = [
            'id', 'atividade', 'atividade_titulo', 'texto',
            'nota', 'feedback', 'aluno', 'aluno_nome',
        ]
        read_only_fields = ['aluno', 'nota', 'feedback', 'atividade_titulo', 'aluno_nome']

    def validate(self, data: dict) -> dict:
        user = self.context['request'].user
        atividade = data.get('atividade')

        if not set(atividade.turma.all()) & set(user.turma.all()):
            raise serializers.ValidationError(
                "Voce nao pode responder atividades de turmas que nao esta inserido."
            )

        if Resposta.objects.filter(aluno=user, atividade=atividade).exists():
            raise serializers.ValidationError("Voce ja respondeu essa atividade.")

        return data

    def create(self, validated_data: dict) -> Resposta:
        validated_data['aluno'] = self.context['request'].user
        return super().create(validated_data)
