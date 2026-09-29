from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import DeviceSyncState, SyncLog
from .serializers import DeviceSyncStateSerializer, SyncPayloadSerializer
import sys

class DeviceSyncStateViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSyncStateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DeviceSyncState.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def sync_push(self, request):
        """Endpoint to receive offline differential payload from edge device."""
        serializer = SyncPayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        device_id = serializer.validated_data['device_id']
        payload = serializer.validated_data['payload']
        
        device, created = DeviceSyncState.objects.get_or_create(
            user=request.user,
            device_id=device_id
        )

        # Basic conflict resolution: just log it as success since it's mock logic
        conflicts = 0
        if 'conflicts' in payload:
            conflicts = len(payload['conflicts'])

        log = SyncLog.objects.create(
            device=device,
            payload_size=sys.getsizeof(payload),
            conflicts_resolved=conflicts,
            status='success'
        )

        device.last_sync_time = timezone.now()
        device.sync_status = 'synced'
        device.save()

        return Response({
            "status": "success",
            "log_id": log.id,
            "last_sync_time": device.last_sync_time,
            "conflicts_resolved": conflicts
        })
