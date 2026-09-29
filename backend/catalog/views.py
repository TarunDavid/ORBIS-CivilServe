from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Enrolment
from .serializers import CourseSerializer, EnrolmentSerializer

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """API for viewing catalog courses."""
    queryset = Course.objects.all().prefetch_related('competencies')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        provider = self.request.query_params.get('provider')
        if provider:
            qs = qs.filter(provider=provider)
        return qs

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll the current user in this course."""
        course = self.get_object()
        enrolment, created = Enrolment.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'status': 'enrolled', 'progress_percent': 0}
        )
        if not created:
            return Response({'message': 'Already enrolled'}, status=status.HTTP_200_OK)
        return Response(
            {'message': 'Successfully enrolled', 'enrolment': EnrolmentSerializer(enrolment).data}, 
            status=status.HTTP_201_CREATED
        )

class EnrolmentViewSet(viewsets.ReadOnlyModelViewSet):
    """API for viewing current user's enrolments."""
    serializer_class = EnrolmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrolment.objects.filter(user=self.request.user).select_related('course')
