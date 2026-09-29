from django.test import TestCase
from django.contrib.auth.models import User
from edge.models import DeviceSyncState, SyncLog
import json

class EdgeSyncTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='edgeuser', password='pass')
        self.device = DeviceSyncState.objects.create(
            user=self.user,
            device_id='android-tablet-01',
            sync_status='pending'
        )

    def test_sync_push(self):
        self.client.login(username='edgeuser', password='pass')
        
        payload = {
            'device_id': 'android-tablet-01',
            'payload': {
                'offline_records': 10,
                'conflicts': ['record_5', 'record_8']
            }
        }
        
        resp = self.client.post('/api/edge/devices/sync_push/', payload, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        
        data = resp.json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['conflicts_resolved'], 2)
        
        # Verify device state updated
        self.device.refresh_from_db()
        self.assertEqual(self.device.sync_status, 'synced')
        self.assertIsNotNone(self.device.last_sync_time)
        
        # Verify log
        log = SyncLog.objects.get(id=data['log_id'])
        self.assertEqual(log.conflicts_resolved, 2)
        self.assertEqual(log.status, 'success')
