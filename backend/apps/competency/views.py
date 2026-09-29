from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CompetencyCategory, Competency, RoleRequirement
from .serializers import CompetencyCategorySerializer, CompetencySerializer, RoleRequirementSerializer

class CompetencyCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows competency categories to be viewed.
    """
    queryset = CompetencyCategory.objects.all()
    serializer_class = CompetencyCategorySerializer
    permission_classes = [IsAuthenticated]


class CompetencyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows individual competencies to be viewed.
    """
    queryset = Competency.objects.filter(is_active=True)
    serializer_class = CompetencySerializer
    permission_classes = [IsAuthenticated]


class RoleRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that exposes the competency requirements.
    """
    queryset = RoleRequirement.objects.all()
    serializer_class = RoleRequirementSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_requirements(self, request):
        """
        Returns the competency requirements for the currently logged-in user's job role.
        """
        user = request.user
        if not hasattr(user, 'orbis_profile') or not user.orbis_profile.job_role:
            return Response({"detail": "No job role assigned to the current user."}, status=400)
            
        job_role = user.orbis_profile.job_role
        requirements = RoleRequirement.objects.filter(job_role=job_role)
        
        # In a real app we'd combine this with their actual current assessment scores.
        # For now, we return the target requirements and mock a current score of 0 for the UI to display gaps.
        
        serializer = self.get_serializer(requirements, many=True)
        data = serializer.data
        
        for item in data:
            item['current_proficiency'] = 0  # Mock value until Phase 3 Evidence is built
            
        return Response(data)
