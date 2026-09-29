from rest_framework import serializers
from .models import CompetencyScore, AssessmentRecord
from core.serializers import CompetencySerializer

class CompetencyScoreSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)

    class Meta:
        model = CompetencyScore
        fields = ['id', 'competency', 'current_level', 'last_assessed']

class AssessmentRecordSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)

    class Meta:
        model = AssessmentRecord
        fields = ['id', 'competency', 'score_change', 'reason', 'timestamp']
