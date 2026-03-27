from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class Resposta(models.Model):
    """Resposta de um aluno para uma atividade. Uma por aluno por atividade."""

    atividade = models.ForeignKey(
        'atividades.Atividade',
        on_delete=models.CASCADE,
        related_name='respostas',
    )
    aluno = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='respostas',
    )
    texto = models.TextField()
    nota = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('atividade', 'aluno')

    def __str__(self) -> str:
        return f"{self.aluno.username} - {self.atividade.titulo}"

    def clean(self) -> None:
        if self.nota is not None and (self.nota < 0 or self.nota > 10):
            raise ValidationError("A nota deve estar entre 0 e 10.")

        if not self.pk and self.atividade and self.atividade.data_entrega:
            if timezone.now() > self.atividade.data_entrega:
                raise ValidationError("O prazo para envio ja expirou.")

    def save(self, *args, **kwargs) -> None:
        self.clean()
        super().save(*args, **kwargs)
