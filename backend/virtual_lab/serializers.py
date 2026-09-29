from rest_framework import serializers
from .models import Scenario, ScenarioAttempt
from core.serializers import CompetencySerializer

class ScenarioSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)
    
    class Meta:
        model = Scenario
        fields = ['id', 'title', 'description', 'competency', 'system_prompt']

class ScenarioAttemptSerializer(serializers.ModelSerializer):
    scenario = ScenarioSerializer(read_only=True)
    scenario_id = serializers.PrimaryKeyRelatedField(
        queryset=Scenario.objects.all(), source='scenario', write_only=True
    )
    
    class Meta:
        model = ScenarioAttempt
        fields = ['id', 'scenario', 'scenario_id', 'transcript', 'score', 'feedback', 'created_at', 'completed_at']
        read_only_fields = ['score', 'feedback', 'completed_at']
