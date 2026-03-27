from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Modelo customizado de usuario com suporte a papeis e turmas.

    Attributes:
        email: Email unico, usado como campo de login.
        role: PROFESSOR ou ALUNO.
        turma: Turmas associadas ao usuario (obrigatorio para alunos).
    """

    ROLE_CHOICES = (
        ('PROFESSOR', 'Professor'),
        ('ALUNO', 'Aluno'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PROFESSOR')
    turma = models.ManyToManyField('turmas.Turma', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"
