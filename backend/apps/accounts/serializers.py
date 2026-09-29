"""
ORBIS Accounts — Serializers
=============================
Serializers for OfficialProfile, Department, JobRole, and authentication.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import OfficialProfile, Department, JobRole


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "code", "description"]


class JobRoleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name", read_only=True, default=None
    )

    class Meta:
        model = JobRole
        fields = ["id", "title", "code", "level", "department", "department_name", "description"]


class CurrentUserSerializer(serializers.Serializer):
    """
    Minimal serializer for GET /api/me — frozen contract.
    Returns: { id, role, department, job_role_id }
    """
    id = serializers.UUIDField(source="orbis_profile.id")
    role = serializers.CharField(source="orbis_profile.role")
    department = serializers.SerializerMethodField()
    job_role_id = serializers.SerializerMethodField()

    def get_department(self, user):
        profile = getattr(user, "orbis_profile", None)
        if profile and profile.department:
            return profile.department.code
        return None

    def get_job_role_id(self, user):
        profile = getattr(user, "orbis_profile", None)
        if profile and profile.job_role_id:
            return str(profile.job_role_id)
        return None


class UserFullSerializer(serializers.Serializer):
    """Full user profile serializer combining auth.User + OfficialProfile."""
    id = serializers.UUIDField(source="orbis_profile.id")
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.CharField(source="orbis_profile.role")
    department = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    department_code = serializers.SerializerMethodField()
    job_role = serializers.SerializerMethodField()
    job_role_title = serializers.SerializerMethodField()
    designation = serializers.CharField(source="orbis_profile.designation")
    employee_id = serializers.CharField(source="orbis_profile.employee_id")
    date_joined = serializers.DateTimeField()

    def get_department(self, user):
        p = getattr(user, "orbis_profile", None)
        return str(p.department_id) if p and p.department_id else None

    def get_department_name(self, user):
        p = getattr(user, "orbis_profile", None)
        return p.department.name if p and p.department else None

    def get_department_code(self, user):
        p = getattr(user, "orbis_profile", None)
        return p.department.code if p and p.department else None

    def get_job_role(self, user):
        p = getattr(user, "orbis_profile", None)
        return str(p.job_role_id) if p and p.job_role_id else None

    def get_job_role_title(self, user):
        p = getattr(user, "orbis_profile", None)
        return p.job_role.title if p and p.job_role else None


class LoginSerializer(serializers.Serializer):
    """Credentials for username/password login."""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)


class MockSSOSerializer(serializers.Serializer):
    """
    Mock OIDC/SSO login — simulates an SSO provider returning a user identifier.
    For hackathon prototype: accepts employee_id or username to simulate SSO.
    """
    sso_token = serializers.CharField(
        max_length=255,
        help_text="Simulated SSO token — use an employee_id or username",
    )
