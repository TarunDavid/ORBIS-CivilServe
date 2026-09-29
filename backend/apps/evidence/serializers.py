from rest_framework import serializers
from .models import EvidenceRecord, OfficialCompetencyScore
from apps.competency.serializers import CompetencySerializer

class EvidenceRecordSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)
    
    class Meta:
        model = EvidenceRecord
        fields = ['id', 'competency', 'source_type', 'source_reference', 'score_raw', 'score_proficiency', 'explanation', 'timestamp']


class OfficialCompetencyScoreSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)
    
    class Meta:
        model = OfficialCompetencyScore
        fields = ['id', 'competency', 'current_proficiency', 'last_updated']
