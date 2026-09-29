from rest_framework import serializers
from .models import LearningPath, PathNode
from core.serializers import CompetencySerializer

class PathNodeSerializer(serializers.ModelSerializer):
    prerequisites = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = PathNode
        fields = ['id', 'title', 'description', 'level', 'status', 'prerequisites']

class LearningPathSerializer(serializers.ModelSerializer):
    target_competency = CompetencySerializer(read_only=True)
    nodes = PathNodeSerializer(many=True, read_only=True)

    class Meta:
        model = LearningPath
        fields = ['id', 'target_competency', 'generated_at', 'nodes']
