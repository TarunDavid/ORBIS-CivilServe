from django.db import models
from django.conf import settings
from core.models import Competency

class Course(models.Model):
    """A learning resource/course fetched from an external provider (e.g., iGOT, TPAC)."""
    PROVIDER_CHOICES = [
        ('igot', 'iGOT Karmayogi'),
        ('tpac', 'TPAC'),
        ('local', 'ORBIS Local'),
    ]

    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, default='')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    external_id = models.CharField(
        max_length=255, 
        help_text="Unique identifier from the provider system"
    )
    source_url = models.URLField(max_length=1000, blank=True, default='')
    duration_minutes = models.IntegerField(default=0)
    
    # Mapping to ORBIS competencies
    competencies = models.ManyToManyField(
        Competency, 
        related_name='courses',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['provider', 'external_id']
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_provider_display()}] {self.title}"


class Enrolment(models.Model):
    """Tracks a user's enrolment and progress in a course."""
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrolments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    progress_percent = models.IntegerField(default=0)
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.get_status_display()})"


class SyncLog(models.Model):
    """Audit log for catalog synchronization runs."""
    provider = models.CharField(max_length=50, choices=Course.PROVIDER_CHOICES)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    courses_added = models.IntegerField(default=0)
    courses_updated = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='success')
    error_message = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Sync {self.provider} at {self.started_at}"
