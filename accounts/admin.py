from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_superuser', 'get_turmas')
    list_filter = ('role', 'is_active', 'is_superuser')
    search_fields = ('username', 'email')

    def get_turmas(self, obj: User) -> str:
        return ", ".join([t.nome for t in obj.turma.all()])
    get_turmas.short_description = 'Turmas'
