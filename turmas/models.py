from django.db import models


class Turma(models.Model):
    """Representa uma turma/classe de alunos."""

    nome = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.nome
