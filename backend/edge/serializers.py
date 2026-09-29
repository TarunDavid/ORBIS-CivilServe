from rest_framework import serializers
from .models import DeviceSyncState, SyncLog

class DeviceSyncStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceSyncState
        fields = ['id', 'device_id', 'last_sync_time', 'sync_status', 'created_at']
        read_only_fields = ['last_sync_time', 'sync_status', 'created_at']

class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = '__all__'
        read_only_fields = ['timestamp']

class SyncPayloadSerializer(serializers.Serializer):
    device_id = serializers.CharField(max_length=255)
    payload = serializers.JSONField()
