"""
ORBIS Accounts — Service Layer
================================
Provides service functions for other apps to query user/role data
without directly importing models (contract-first architecture).
"""

from .models import OfficialProfile, Department, JobRole


def get_profile_by_user(user):
    """Retrieve the OfficialProfile for a Django auth.User. Returns None if not found."""
    try:
        return OfficialProfile.objects.select_related("department", "job_role").get(user=user)
    except OfficialProfile.DoesNotExist:
        return None


def get_profile_by_id(profile_id):
    """Retrieve an OfficialProfile by its UUID."""
    try:
        return OfficialProfile.objects.select_related("user", "department", "job_role").get(id=profile_id)
    except OfficialProfile.DoesNotExist:
        return None


def get_user_role(user):
    """Return the user's ORBIS role string, or None."""
    profile = get_profile_by_user(user)
    return profile.role if profile else None


def get_user_department(user):
    """Return the user's department code, or None."""
    profile = get_profile_by_user(user)
    return profile.department.code if profile and profile.department else None


def get_user_job_role_id(user):
    """Return the user's job role UUID, or None."""
    profile = get_profile_by_user(user)
    return profile.job_role_id if profile else None


def get_job_role(job_role_id):
    """Retrieve a job role by its UUID. Returns None if not found."""
    try:
        return JobRole.objects.select_related("department").get(id=job_role_id)
    except JobRole.DoesNotExist:
        return None


def list_departments():
    """Return all departments."""
    return Department.objects.all()


def list_job_roles(department_id=None):
    """Return job roles, optionally filtered by department."""
    qs = JobRole.objects.select_related("department").all()
    if department_id:
        qs = qs.filter(department_id=department_id)
    return qs
