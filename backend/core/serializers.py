from rest_framework import serializers
from .models import Role, Competency, RoleCompetency, UserProfile


class CompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Competency
        fields = ['id', 'name', 'description', 'domain']


class RoleCompetencySerializer(serializers.ModelSerializer):
    competency = CompetencySerializer(read_only=True)

    class Meta:
        model = RoleCompetency
        fields = ['id', 'competency', 'required_level']


class RoleSerializer(serializers.ModelSerializer):
    competencies = RoleCompetencySerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'domain', 'competencies']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    assigned_role_name = serializers.CharField(
        source='assigned_role.name', read_only=True, default=None
    )

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'role', 'department',
            'preferred_language', 'assigned_role', 'assigned_role_name',
        ]
