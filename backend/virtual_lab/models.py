from django.db import models
from django.contrib.auth.models import User
from core.models import Competency

class Scenario(models.Model):
    """A virtual role-play scenario definition."""
    title = models.CharField(max_length=255)
    description = models.TextField()
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='scenarios')
    system_prompt = models.TextField(help_text="The LLM prompt defining the persona and rules for this scenario.")
    
    def __str__(self):
        return self.title

class ScenarioAttempt(models.Model):
    """A user's attempt at a scenario."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scenario_attempts')
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name='attempts')
    transcript = models.JSONField(default=list, help_text="List of message objects (role, content)")
    score = models.FloatField(null=True, blank=True, help_text="AI-graded score for this attempt")
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.scenario.title} ({self.created_at.date()})"
