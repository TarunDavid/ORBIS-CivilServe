from django.db import models
from core.models import Competency

class LearningPath(models.Model):
    """An AI-generated DAG of learning nodes for a specific competency."""
    target_competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='learning_paths')
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Path for {self.target_competency.name}"


class PathNode(models.Model):
    """A node in the learning path (a sub-skill or topic)."""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('mastered', 'Mastered'),
    ]

    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='nodes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    level = models.IntegerField(default=1, help_text="Depth level in the DAG")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    
    # Self-referential ManyToMany for prerequisites
    prerequisites = models.ManyToManyField('self', symmetrical=False, related_name='dependents', blank=True)

    class Meta:
        ordering = ['level', 'title']

    def __str__(self):
        return f"[{self.level}] {self.title}"
