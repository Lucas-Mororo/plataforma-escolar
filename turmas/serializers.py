from rest_framework import serializers
from .models import Turma


class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome']


class TurmaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome']
