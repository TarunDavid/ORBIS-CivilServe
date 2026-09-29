from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CompetencyLab, LabSession
from .serializers import CompetencyLabSerializer, LabSessionSerializer
from .evaluator import evaluate_lab_submission
from apps.evidence.services import record_evidence

class CompetencyLabViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompetencyLab.objects.filter(is_active=True)
    serializer_class = CompetencyLabSerializer
    permission_classes = [IsAuthenticated]


class LabSessionViewSet(viewsets.ModelViewSet):
    serializer_class = LabSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'orbis_profile'):
            return LabSession.objects.none()
        return LabSession.objects.filter(official=user.orbis_profile).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(official=self.request.user.orbis_profile)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Receives user code/text, invokes LLM evaluator, and creates Evidence.
        """
        session = self.get_object()
        
        if session.status == 'completed':
            return Response({"error": "This lab session is already completed."}, status=status.HTTP_400_BAD_REQUEST)
            
        user_input = request.data.get('user_input', '')
        
        # 1. Update session to Evaluating
        session.user_input = user_input
        session.status = 'evaluating'
        session.save()
        
        # 2. Call the LLM Evaluation Agent
        evaluation = evaluate_lab_submission(session)
        score_raw = evaluation['score']
        feedback = evaluation['feedback']
        
        # 3. Save evaluation results
        session.llm_score_raw = score_raw
        session.llm_feedback = feedback
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.save()
        
        # 4. Record the Evidence in the ORBIS Measurement pipeline!
        record_evidence(
            official=session.official,
            competency=session.lab.competency,
            source_type='competency_lab',
            raw_score=score_raw,
            explanation=feedback,
            source_reference=str(session.id)
        )
        
        return Response(self.get_serializer(session).data)
