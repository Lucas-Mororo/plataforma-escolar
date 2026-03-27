from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Modelo customizado de usuario com suporte a papeis e turmas.

    Attributes:
        role: PROFESSOR ou ALUNO.
        turma: Turmas associadas ao usuario (obrigatorio para alunos).
    """

    ROLE_CHOICES = (
        ('PROFESSOR', 'Professor'),
        ('ALUNO', 'Aluno'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PROFESSOR')
    turma = models.ManyToManyField('turmas.Turma', blank=True)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
