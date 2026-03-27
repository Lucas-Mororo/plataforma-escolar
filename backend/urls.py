from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def hello(request):
    return Response({"message": "API funcionando!"})


urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('hello/', hello),
    path('', include('accounts.urls')),
    path('', include('turmas.urls')),
    path('', include('atividades.urls')),
    path('', include('respostas.urls')),
]
