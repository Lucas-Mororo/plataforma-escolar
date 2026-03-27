from rest_framework import serializers
from turmas.serializers import TurmaSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer publico — NAO expoe is_superuser. Usado no login."""

    turmas = TurmaSerializer(source='turma', many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'turma', 'turmas', 'is_active']


class UserMeSerializer(serializers.ModelSerializer):
    """Serializer privado para /auth/me/. Inclui is_admin computado."""

    turmas = TurmaSerializer(source='turma', many=True, read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'turmas', 'is_active', 'is_admin']

    def get_is_admin(self, obj: User) -> bool:
        return obj.is_superuser and obj.is_active


class UserAdminSerializer(UserMeSerializer):
    """Serializer admin — herda de UserMeSerializer (mesmos campos)."""
    pass


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para registro publico. Usuario inicia inativo."""

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'turma']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data: dict) -> User:
        turmas = validated_data.pop('turma', [])
        user = User(
            username=validated_data['username'],
            role=validated_data['role'],
            is_active=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        user.turma.set(turmas)
        return user
