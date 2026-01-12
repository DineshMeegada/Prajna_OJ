from pathlib import Path

from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response

from .models import Problem
from .serializers import ProblemListSerializer, ProblemDetailSerializer

class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemListSerializer
    pagination_class = None

class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.select_related('created_by').all()
    serializer_class = ProblemDetailSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        problem = self.get_object()

        statement_path = Path(settings.STATEMENTS_DIR) / str(problem.uuid) / "description.txt"
        if statement_path.exists():
            response.data['statement'] = statement_path.read_text(encoding='utf-8')
            return response
        return Response(
            {"detail": "Problem statement file missing"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )