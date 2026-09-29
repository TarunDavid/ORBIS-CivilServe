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


from rest_framework.views import APIView
from apps.accounts.models import OfficialProfile
from .services import generate_competency_card
from django.db import models

class CompetencyCardView(APIView):
    """
    Returns the official competency card & digital skill passport.
    Supports GET /api/competency/card/me/ and GET /api/competency/card/<official_id>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, official_id=None):
        if official_id:
            try:
                official = OfficialProfile.objects.select_related('user', 'department', 'job_role').get(id=official_id)
            except OfficialProfile.DoesNotExist:
                return Response({"detail": "Official profile not found."}, status=404)
        else:
            user = request.user
            if not hasattr(user, 'orbis_profile'):
                return Response({"detail": "No official profile associated with current account."}, status=400)
            official = user.orbis_profile

        card_data = generate_competency_card(official)
        return Response(card_data)


class UserCompetencyCardView(APIView):
    """
    Contract endpoint: GET /api/users/<id>/competency-card/ or GET /api/users/me/competency-card/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if not user_id or str(user_id).lower() == 'me':
            official = getattr(request.user, 'orbis_profile', None)
        else:
            official = None
            import uuid
            try:
                uuid_val = uuid.UUID(str(user_id))
                official = OfficialProfile.objects.filter(id=uuid_val).first()
            except (ValueError, TypeError):
                pass

            if not official:
                if str(user_id).isdigit():
                    official = OfficialProfile.objects.filter(user__id=int(user_id)).first()
                else:
                    official = OfficialProfile.objects.filter(user__username=user_id).first()

        if not official:
            return Response({"detail": "Official profile not found."}, status=404)

        card_data = generate_competency_card(official)
        return Response(card_data)
