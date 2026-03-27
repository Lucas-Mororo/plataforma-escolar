from django.db import models
from django.conf import settings


class Atividade(models.Model):
    """Atividade criada por um professor, associada a turmas."""

    titulo = models.CharField(max_length=255)
    descricao = models.TextField()
    data_entrega = models.DateTimeField()
    professor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='atividades_criadas',
    )
    turma = models.ManyToManyField('turmas.Turma', related_name='atividades')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.titulo
