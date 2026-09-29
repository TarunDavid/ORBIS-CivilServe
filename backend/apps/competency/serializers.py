from rest_framework import serializers
from .models import CompetencyCategory, Competency, RoleRequirement

class CompetencyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetencyCategory
        fields = ['id', 'name', 'description']


class CompetencySerializer(serializers.ModelSerializer):
    category = CompetencyCategorySerializer(read_only=True)

    class Meta:
        model = Competency
        fields = ['id', 'name', 'code', 'category', 'description', 'is_active']


class RoleRequirementSerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)

    class Meta:
        model = RoleRequirement
        fields = ['id', 'competency', 'target_proficiency', 'weight']
