from django.db import models
from pathways.models import PathNode

class Material(models.Model):
    """Uploaded content (PDF, Video) for a specific PathNode or general use."""
    TYPE_CHOICES = [
        ('pdf', 'PDF Document'),
        ('video', 'Video File'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending Processing'),
        ('processing', 'Extracting & Embedding...'),
        ('ready', 'Ready for AI'),
        ('failed', 'Processing Failed'),
    ]

    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='materials/')
    material_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    node = models.ForeignKey(
        PathNode, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='materials', help_text='Optional: Assign to a specific pathway node.'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title


class ExtractedChunk(models.Model):
    """
    A chunk of text extracted from a Material, along with its embedding.
    SQLite-vec doesn't have a native Django field yet, so we store the embedding 
    as a raw binary blob for insertion into the vec virtual table.
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    
    # For video timestamps
    start_time = models.FloatField(null=True, blank=True)
    end_time = models.FloatField(null=True, blank=True)
    
    # Vector embedding (stored as binary for sqlite-vec)
    embedding_blob = models.BinaryField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"Chunk from {self.material.title} ({len(self.content)} chars)"
