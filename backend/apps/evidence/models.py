import uuid
from django.db import models
from apps.accounts.models import OfficialProfile
from apps.competency.models import Competency

class EvidenceRecord(models.Model):
    """
    A single piece of evidence that proves a user has demonstrated a competency.
    """
    SOURCE_CHOICES = [
        ('knowledge_assessment', 'Knowledge Assessment'),
        ('competency_lab', 'Experiential Competency Lab'),
        ('virtual_lab', 'Virtual Lab (Python/SQL)'),
        ('course_completion', 'Course Completion Context'),
        ('manual_review', 'Manual Review / Interview')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    official = models.ForeignKey(OfficialProfile, on_delete=models.CASCADE, related_name='evidence_records')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='evidence_records')
    
    source_type = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    source_reference = models.CharField(max_length=255, blank=True, help_text="ID or link to the specific lab/quiz")
    
    score_raw = models.FloatField(help_text="Raw percentage or points (e.g. 72.5)")
    score_proficiency = models.IntegerField(help_text="Mapped to 1-5 ORBIS proficiency scale")
    
    explanation = models.TextField(help_text="Deterministic explanation of why this score was given")
    
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.official.user.username} - {self.competency.name} (L{self.score_proficiency})"


class OfficialCompetencyScore(models.Model):
    """
    The aggregated, current actual proficiency score for an Official for a specific Competency.
    Updated whenever new EvidenceRecord is generated.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    official = models.ForeignKey(OfficialProfile, on_delete=models.CASCADE, related_name='competency_scores')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='official_scores')
    
    current_proficiency = models.IntegerField(default=0, help_text="Current aggregated level 1-5")
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('official', 'competency')

    def __str__(self):
        return f"{self.official.user.username} - {self.competency.name}: L{self.current_proficiency}"
