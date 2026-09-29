from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Competency, Role, RoleCompetency, UserProfile
from analytics.models import CompetencyScore, AssessmentRecord
from analytics.services.diagnostics import DiagnosticService

class AnalyticsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='statuser', password='pass')
        self.role = Role.objects.create(name='Senior Statistician', description='Expert')
        UserProfile.objects.create(user=self.user, assigned_role=self.role)
        
        self.comp1 = Competency.objects.create(name='Python', domain='Code')
        self.comp2 = Competency.objects.create(name='Survey', domain='Stats')
        
        RoleCompetency.objects.create(role=self.role, competency=self.comp1, required_level=3)
        RoleCompetency.objects.create(role=self.role, competency=self.comp2, required_level=2)

    def test_diagnostic_radar(self):
        # User has level 1.0 in Python, 0.0 in Survey
        CompetencyScore.objects.create(user=self.user, competency=self.comp1, current_level=1.0)
        
        radar = DiagnosticService.get_user_radar(self.user.id)
        
        self.assertEqual(radar['role'], 'Senior Statistician')
        self.assertEqual(len(radar['radar_data']), 2)
        
        for data in radar['radar_data']:
            if data['competency_name'] == 'Python':
                self.assertEqual(data['current_level'], 1.0)
                self.assertEqual(data['gap'], 2.0) # 3.0 - 1.0
            elif data['competency_name'] == 'Survey':
                self.assertEqual(data['current_level'], 0.0)
                self.assertEqual(data['gap'], 2.0) # 2.0 - 0.0

    def test_api_endpoints(self):
        self.client.login(username='statuser', password='pass')
        
        AssessmentRecord.objects.create(
            user=self.user, competency=self.comp1, score_change=1.0, reason='Course'
        )
        
        resp_scores = self.client.get('/api/analytics/me/scores/')
        self.assertEqual(resp_scores.status_code, 200)
        
        resp_history = self.client.get('/api/analytics/me/history/')
        self.assertEqual(resp_history.status_code, 200)
        self.assertEqual(len(resp_history.json()), 1)
        
        resp_radar = self.client.get('/api/analytics/me/radar/')
        self.assertEqual(resp_radar.status_code, 200)
        self.assertEqual(resp_radar.json()['role'], 'Senior Statistician')

        resp_heatmap = self.client.get('/api/analytics/me/activity_heatmap/')
        self.assertEqual(resp_heatmap.status_code, 200)
        self.assertEqual(len(resp_heatmap.json()), 1)
