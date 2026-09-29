from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Competency
from catalog.models import Course, Enrolment, SyncLog
from catalog.services.providers import MockJsonProvider, SyncService

class MockCustomProvider(MockJsonProvider):
    """A test-only provider to prevent needing actual files during testing"""
    def __init__(self):
        super().__init__('test_courses.json', 'local')
        
    def fetch_courses(self):
        return [
            {
                "id": "test-001",
                "title": "Test Course 1",
                "duration_minutes": 60,
                "competencies": ["Survey Design"]
            }
        ]

class CatalogTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cataloguser', password='pass')
        self.comp = Competency.objects.create(name='Survey Design', domain='Stats')
        
    def test_sync_service(self):
        provider = MockCustomProvider()
        log = SyncService.sync_provider(provider)
        
        self.assertEqual(log.status, 'success')
        self.assertEqual(log.courses_added, 1)
        
        course = Course.objects.get(external_id='test-001')
        self.assertEqual(course.title, 'Test Course 1')
        self.assertTrue(course.competencies.filter(name='Survey Design').exists())
        
        # Test idempotent updates
        log2 = SyncService.sync_provider(provider)
        self.assertEqual(log2.courses_added, 0)
        self.assertEqual(log2.courses_updated, 1)

    def test_enrolment_api(self):
        course = Course.objects.create(
            title='API Test Course',
            provider='igot',
            external_id='api-001'
        )
        self.client.login(username='cataloguser', password='pass')
        
        # List courses
        resp = self.client.get('/api/catalog/courses/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)
        
        # Enroll
        resp = self.client.post(f'/api/catalog/courses/{course.id}/enroll/')
        self.assertEqual(resp.status_code, 201)
        
        # Check enrolment
        resp = self.client.get('/api/catalog/enrolments/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)
        self.assertEqual(resp.json()[0]['course']['title'], 'API Test Course')
        
        # Enroll again (idempotent)
        resp = self.client.post(f'/api/catalog/courses/{course.id}/enroll/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['message'], 'Already enrolled')
