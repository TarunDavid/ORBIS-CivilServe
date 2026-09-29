from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LearningPath, PathNode
from .serializers import LearningPathSerializer
from .services.generator import PathwayGenerator
from core.models import Competency

class LearningPathViewSet(viewsets.ReadOnlyModelViewSet):
    """API for viewing and generating Adaptive Learning Pathways."""
    queryset = LearningPath.objects.all().prefetch_related('nodes__prerequisites', 'target_competency')
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a DAG learning path for a given competency ID."""
        competency_id = request.data.get('competency_id')
        if not competency_id:
            return Response({'error': 'competency_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            Competency.objects.get(id=competency_id)
        except Competency.DoesNotExist:
            return Response({'error': 'Competency not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            path = PathwayGenerator.generate_path(competency_id)
            return Response(LearningPathSerializer(path).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
