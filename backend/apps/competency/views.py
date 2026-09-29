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
        requirements = RoleRequirement.objects.filter(job_role=job_role).select_related('competency')
        
        # Fetch current scores from the Evidence engine
        from apps.evidence.models import OfficialCompetencyScore
        scores = OfficialCompetencyScore.objects.filter(
            official=user.orbis_profile,
            competency__in=[req.competency for req in requirements]
        )
        score_map = {s.competency_id: s.current_proficiency for s in scores}
        
        serializer = self.get_serializer(requirements, many=True)
        data = serializer.data
        
        for item in data:
            competency_id = item['competency']['id']
            item['current_proficiency'] = score_map.get(competency_id, 0)
            
        return Response(data)
