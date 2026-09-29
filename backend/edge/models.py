from django.db import models
from django.contrib.auth.models import User

class DeviceSyncState(models.Model):
    """Tracks the synchronization state of an offline device (e.g. Android tablet, edge server)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    device_id = models.CharField(max_length=255, help_text="Unique identifier for the physical device")
    last_sync_time = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'device_id')

    def __str__(self):
        return f"{self.user.username} - {self.device_id}"

class SyncLog(models.Model):
    """Detailed log of synchronization payloads and conflict resolutions."""
    device = models.ForeignKey(DeviceSyncState, on_delete=models.CASCADE, related_name='logs')
    payload_size = models.IntegerField(help_text="Size of sync payload in bytes")
    conflicts_resolved = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='success')
    error_message = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sync {self.id} for {self.device.device_id} at {self.timestamp}"
