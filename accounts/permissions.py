from rest_framework.permissions import BasePermission


class IsProfessor(BasePermission):
    """Permite acesso a usuarios com role PROFESSOR ou superusers."""

    def has_permission(self, request, view) -> bool:
        if request.user.is_superuser:
            return True
        return request.user.role == 'PROFESSOR'


class IsAluno(BasePermission):
    """Permite acesso a usuarios com role ALUNO ou superusers."""

    def has_permission(self, request, view) -> bool:
        if request.user.is_superuser:
            return True
        return request.user.role == 'ALUNO'
