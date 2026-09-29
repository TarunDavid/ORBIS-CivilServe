from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Material, ExtractedChunk
from .serializers import MaterialSerializer
from core.models import Job

class MaterialViewSet(viewsets.ModelViewSet):
    """API for uploading and managing materials in the Content Studio."""
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        material = serializer.save(status='pending')
        
        # Dispatch background job
        Job.objects.create(
            task_name='content.services.extraction.process_material',
            args={'material_id': material.id},
            created_by=self.request.user
        )

    @action(detail=True, methods=['get'])
    def chunks(self, request, pk=None):
        material = self.get_object()
        chunks = ExtractedChunk.objects.filter(material=material).values('id', 'content', 'start_time', 'end_time')
        return Response(list(chunks))
