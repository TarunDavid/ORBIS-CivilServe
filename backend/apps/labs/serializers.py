from rest_framework import serializers
from .models import CompetencyLab, LabSession
from apps.competency.serializers import CompetencySerializer

class CompetencyLabSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)
    
    class Meta:
        model = CompetencyLab
        fields = ['id', 'competency', 'title', 'description', 'environment_type', 'scenario_data', 'is_active']


class LabSessionSerializer(serializers.ModelSerializer):
    lab = CompetencyLabSerializer(read_only=True)
    lab_id = serializers.PrimaryKeyRelatedField(
        queryset=CompetencyLab.objects.all(), source='lab', write_only=True
    )
    
    class Meta:
        model = LabSession
        fields = ['id', 'lab', 'lab_id', 'user_input', 'session_state', 'llm_score_raw', 'llm_feedback', 'status', 'created_at', 'completed_at']
