from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.request import Request
from django.db.models import QuerySet


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def paginate_queryset(
    request: Request,
    queryset: QuerySet,
    serializer_class,
    context: dict | None = None,
) -> Response:
    """Pagina um queryset e retorna Response no formato padrao do DRF."""
    paginator = StandardPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = serializer_class(page, many=True, context=context or {})
        return paginator.get_paginated_response(serializer.data)
    serializer = serializer_class(queryset, many=True, context=context or {})
    return Response(serializer.data)
