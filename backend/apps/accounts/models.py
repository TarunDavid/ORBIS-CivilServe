"""
ORBIS Accounts — Models
=======================
Official user profile with role, department, and job-role association.
Uses a profile-extension pattern (OneToOne to Django's auth.User) to avoid
breaking existing models that reference 'auth.User' directly.

This avoids the AUTH_USER_MODEL swap which would break Dev B's existing models.
"""

import uuid
from django.conf import settings
from django.db import models


class Department(models.Model):
    """Government department or ministry."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True, help_text="Short code, e.g. MOSPI, CSO")
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class JobRole(models.Model):
    """
    Official job role / designation within the statistical system.
    Each job role maps to a set of required competencies (defined in the competency app).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True, help_text="Short code, e.g. SO, DSO, DD")
    level = models.CharField(
        max_length=50,
        choices=[
            ("entry", "Entry Level"),
            ("mid", "Mid Level"),
            ("senior", "Senior Level"),
            ("leadership", "Leadership"),
        ],
        default="entry",
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_roles",
    )
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["level", "title"]

    def __str__(self):
        return f"{self.title} ({self.code})"


class OfficialProfile(models.Model):
    """
    ORBIS official profile — extends Django's auth.User via OneToOneField.
    This is the ORBIS identity layer for competency intelligence.

    Uses profile-extension pattern instead of AUTH_USER_MODEL swap to avoid
    breaking existing api.TeacherProfile, api.ContentAsset references.
    """
    ROLE_CHOICES = [
        ("official", "Official / Learner"),
        ("trainer", "Trainer"),
        ("admin", "Administrator"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orbis_profile",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="official")
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="officials",
    )
    job_role = models.ForeignKey(
        JobRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="officials",
    )
    designation = models.CharField(max_length=255, blank=True, default="")
    employee_id = models.CharField(
        max_length=100, blank=True, default="",
        unique=True,
        help_text="Government employee ID (for demo / SSO simulation)",
    )

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        name = self.user.get_full_name() or self.user.username
        return f"{name} ({self.role})"

    @property
    def is_official(self):
        return self.role == "official"

    @property
    def is_trainer(self):
        return self.role == "trainer"

    @property
    def is_orbis_admin(self):
        return self.role == "admin"
