from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CompetencyScore, AssessmentRecord
from .serializers import CompetencyScoreSerializer, AssessmentRecordSerializer
from .services.diagnostics import DiagnosticService

class AnalyticsViewSet(viewsets.ViewSet):
    """API for viewing user progress and diagnostic heatmaps."""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def scores(self, request):
        scores = CompetencyScore.objects.filter(user=request.user)
        return Response(CompetencyScoreSerializer(scores, many=True).data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        records = AssessmentRecord.objects.filter(user=request.user)
        return Response(AssessmentRecordSerializer(records, many=True).data)

    @action(detail=False, methods=['get'])
    def radar(self, request):
        """Get radar/gap analysis data based on user's role targets."""
        data = DiagnosticService.get_user_radar(request.user.id)
        if "error" in data:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=False, methods=['get'])
    def activity_heatmap(self, request):
        """
        Mock activity heatmap data (since we're mapping to the old Dashboard logic).
        We'll map AssessmentRecords to a daily count to feed the heatmap.
        """
        from django.db.models import Count
        from django.db.models.functions import TruncDate
        
        daily_counts = AssessmentRecord.objects.filter(user=request.user)\
            .annotate(date=TruncDate('timestamp'))\
            .values('date')\
            .annotate(count=Count('id'))\
            .order_by('date')
            
        activity_data = [
            {"date": item['date'].strftime('%Y-%m-%d'), "count": item['count']}
            for item in daily_counts
        ]
        return Response(activity_data)
