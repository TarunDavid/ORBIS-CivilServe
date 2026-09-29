from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import EvidenceRecord, OfficialCompetencyScore
from .serializers import EvidenceRecordSerializer, OfficialCompetencyScoreSerializer
from .services import record_evidence
from apps.competency.models import Competency

class EvidenceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EvidenceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'orbis_profile'):
            return EvidenceRecord.objects.none()
        return EvidenceRecord.objects.filter(official=user.orbis_profile)

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        Submit a new piece of evidence (e.g. from a quiz or lab).
        Payload: { competency_id, source_type, source_reference, score_raw, explanation }
        """
        user = request.user
        if not hasattr(user, 'orbis_profile'):
            return Response({"error": "No official profile found."}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data
        try:
            competency = Competency.objects.get(id=data['competency_id'])
            evidence = record_evidence(
                official=user.orbis_profile,
                competency=competency,
                source_type=data['source_type'],
                raw_score=float(data['score_raw']),
                explanation=data['explanation'],
                source_reference=data.get('source_reference', '')
            )
            serializer = self.get_serializer(evidence)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Competency.DoesNotExist:
            return Response({"error": "Invalid competency ID."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ScoreViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OfficialCompetencyScoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'orbis_profile'):
            return OfficialCompetencyScore.objects.none()
        return OfficialCompetencyScore.objects.filter(official=user.orbis_profile)
