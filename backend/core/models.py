"""
ORBIS Core Domain Models
========================
Shared domain primitives used across all modules:
  - Role, Competency, RoleCompetency (competency framework)
  - UserProfile (extends Django auth.User with role, department, language)
  - Job (DB-backed async job table for long-running tasks)
"""

from django.db import models
from django.conf import settings


class Role(models.Model):
    """A job role in the Official Statistical System (e.g. "Statistical Officer")."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, default='')
    domain = models.CharField(
        max_length=100, blank=True, default='',
        help_text='Domain area, e.g. "Statistics", "Data Science"'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Competency(models.Model):
    """A measurable skill or knowledge area (e.g. "Survey Design", "SQL")."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, default='')
    domain = models.CharField(
        max_length=100, blank=True, default='',
        help_text='Domain grouping, e.g. "Statistical Methods", "IT Skills"'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['domain', 'name']
        verbose_name_plural = 'Competencies'

    def __str__(self):
        return self.name


class RoleCompetency(models.Model):
    """Maps a competency to a role with a required proficiency level (1-5)."""
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='competencies')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='roles')
    required_level = models.IntegerField(
        default=3,
        help_text='Required proficiency level: 1 (Beginner) to 5 (Expert)'
    )

    class Meta:
        unique_together = ['role', 'competency']
        ordering = ['role', 'competency']
        verbose_name = 'Role-Competency Mapping'
        verbose_name_plural = 'Role-Competency Mappings'

    def __str__(self):
        return f"{self.role.name} → {self.competency.name} (Level {self.required_level})"


class UserProfile(models.Model):
    """
    Extends Django auth.User for the competency platform.
    Coexists with the legacy Student model (which is kept for the existing tutor flow).
    """
    ROLE_CHOICES = [
        ('learner', 'Learner'),
        ('trainer', 'Trainer'),
        ('admin', 'Admin'),
    ]
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('kn', 'Kannada'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='learner')
    department = models.CharField(max_length=255, blank=True, default='')
    preferred_language = models.CharField(
        max_length=5, choices=LANGUAGE_CHOICES, default='en'
    )
    assigned_role = models.ForeignKey(
        Role, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='users',
        help_text='The official role this user holds (for competency mapping)'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['user__username']

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


class Job(models.Model):
    """
    DB-backed async job for long-running tasks (Whisper, embeddings, MCQ generation).
    Processed by the `run_worker` management command. No Celery/Redis needed.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    task_name = models.CharField(
        max_length=255,
        help_text='Dotted path to the task function, e.g. "content.services.extraction.extract_material"'
    )
    args = models.JSONField(default=dict, blank=True, help_text='Keyword arguments for the task')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result = models.JSONField(null=True, blank=True, help_text='Task return value or error details')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Job #{self.pk} [{self.status}] {self.task_name}"
