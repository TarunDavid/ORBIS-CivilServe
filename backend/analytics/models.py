from django.db import models
from django.contrib.auth.models import User
from core.models import Competency

class CompetencyScore(models.Model):
    """Current mastery level for a user on a given competency."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='competency_scores')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='scores')
    current_level = models.FloatField(default=0.0)
    last_assessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'competency')

    def __str__(self):
        return f"{self.user.username} - {self.competency.name} ({self.current_level})"


class AssessmentRecord(models.Model):
    """Historical log of assessments that changed a user's competency score."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_records')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='assessment_records')
    score_change = models.FloatField()
    reason = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} {self.score_change:+} on {self.competency.name} ({self.reason})"
