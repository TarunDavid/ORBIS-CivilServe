from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Scenario, ScenarioAttempt
from .serializers import ScenarioSerializer, ScenarioAttemptSerializer
from .services.simulator import SimulatorService
from analytics.models import AssessmentRecord

class ScenarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]

class ScenarioAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = ScenarioAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScenarioAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def turn(self, request, pk=None):
        """Processes a single conversational turn in the scenario."""
        attempt = self.get_object()
        
        if attempt.completed_at:
            return Response({"error": "This scenario attempt is already completed."}, status=status.HTTP_400_BAD_REQUEST)
            
        user_message = request.data.get('content')
        if not user_message:
            return Response({"error": "Content required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Append user message
        attempt.transcript.append({"role": "user", "content": user_message})
        
        # Get simulator response
        ai_response = SimulatorService.process_turn(attempt.scenario.system_prompt, attempt.transcript)
        
        # Append AI response
        attempt.transcript.append({"role": "assistant", "content": ai_response})
        attempt.save()
        
        return Response(attempt.transcript)

    @action(detail=True, methods=['post'])
    def finish(self, request, pk=None):
        """Concludes the scenario, gets AI evaluation, and logs assessment record."""
        attempt = self.get_object()
        
        if attempt.completed_at:
            return Response({"error": "Already completed"}, status=status.HTTP_400_BAD_REQUEST)
            
        evaluation = SimulatorService.evaluate_attempt(attempt.scenario.system_prompt, attempt.transcript)
        
        attempt.score = evaluation.get('score', 0.0)
        attempt.feedback = evaluation.get('feedback', '')
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # Log to Analytics to improve CompetencyScore
        AssessmentRecord.objects.create(
            user=attempt.user,
            competency=attempt.scenario.competency,
            score_change=attempt.score / 100.0, # Scale 0-100 to 0.0-1.0 proficiency level
            reason=f"Completed AI Scenario: {attempt.scenario.title}"
        )
        
        return Response(ScenarioAttemptSerializer(attempt).data)
