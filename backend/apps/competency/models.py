import uuid
from django.db import models
from apps.accounts.models import JobRole

class CompetencyCategory(models.Model):
    """
    High-level grouping of competencies.
    E.g. 'Statistical', 'Technical', 'Digital Governance', 'Behavioral / Managerial'
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Competency Categories"

    def __str__(self):
        return self.name


class Competency(models.Model):
    """
    A specific competency evaluated by ORBIS.
    E.g. 'Survey Design', 'Data Quality', 'Python', 'Leadership'
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        CompetencyCategory,
        on_delete=models.CASCADE,
        related_name="competencies"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True, help_text="Short identifier e.g. STAT-SD")
    description = models.TextField(blank=True, default="")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category__name", "name"]
        verbose_name_plural = "Competencies"

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class RoleRequirement(models.Model):
    """
    Maps a JobRole to a required Competency along with a target proficiency level.
    """
    PROFICIENCY_CHOICES = [
        (1, "Basic"),
        (2, "Intermediate"),
        (3, "Advanced"),
        (4, "Expert"),
        (5, "Master")
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_role = models.ForeignKey(
        JobRole,
        on_delete=models.CASCADE,
        related_name="competency_requirements"
    )
    competency = models.ForeignKey(
        Competency,
        on_delete=models.CASCADE,
        related_name="role_requirements"
    )
    target_proficiency = models.IntegerField(
        choices=PROFICIENCY_CHOICES,
        default=2,
        help_text="The required proficiency level (1-5) for this role."
    )
    weight = models.FloatField(
        default=1.0, 
        help_text="Importance multiplier for this role (e.g., 1.5 for core skill, 0.5 for secondary)"
    )

    class Meta:
        unique_together = ("job_role", "competency")
        ordering = ["job_role__title", "competency__name"]

    def __str__(self):
        return f"{self.job_role.title} requires {self.competency.name} (Level {self.target_proficiency})"
