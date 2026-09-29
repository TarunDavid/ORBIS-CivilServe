from django.test import TestCase
from django.contrib.auth.models import User
from unittest.mock import patch
from core.models import Competency
from virtual_lab.models import Scenario, ScenarioAttempt
from analytics.models import AssessmentRecord

class VirtualLabTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='labuser', password='pass')
        self.comp = Competency.objects.create(name='Data Collection', domain='Field Work')
        
        self.scenario = Scenario.objects.create(
            title='Survey Interview',
            description='Conduct a mock field survey.',
            competency=self.comp,
            system_prompt='You are a rural respondent. Answer questions based on the scenario.'
        )

    @patch('ai_engine.services.LLMService.chat')
    def test_scenario_turn(self, mock_llm):
        mock_llm.return_value = {
            'choices': [{'message': {'content': 'Hello, I am the respondent.'}}]
        }
        
        self.client.login(username='labuser', password='pass')
        
        # Start attempt
        resp = self.client.post('/api/virtual_lab/attempts/', {'scenario_id': self.scenario.id})
        self.assertEqual(resp.status_code, 201)
        attempt_id = resp.json()['id']
        
        # Take a turn
        resp = self.client.post(f'/api/virtual_lab/attempts/{attempt_id}/turn/', {
            'content': 'Hi, I am here for the survey.'
        }, content_type='application/json')
        
        self.assertEqual(resp.status_code, 200)
        
        # Verify transcript
        transcript = resp.json()
        self.assertEqual(len(transcript), 2)
        self.assertEqual(transcript[0]['role'], 'user')
        self.assertEqual(transcript[1]['role'], 'assistant')
        self.assertEqual(transcript[1]['content'], 'Hello, I am the respondent.')

    @patch('ai_engine.services.LLMService.generate_json')
    def test_scenario_finish(self, mock_llm_json):
        mock_llm_json.return_value = {
            'score': 85.0,
            'feedback': 'Good job asking open questions.'
        }
        
        self.client.login(username='labuser', password='pass')
        
        # Start attempt
        resp = self.client.post('/api/virtual_lab/attempts/', {'scenario_id': self.scenario.id})
        attempt_id = resp.json()['id']
        
        # Finish attempt
        resp = self.client.post(f'/api/virtual_lab/attempts/{attempt_id}/finish/')
        self.assertEqual(resp.status_code, 200)
        
        # Verify attempt update
        attempt = ScenarioAttempt.objects.get(id=attempt_id)
        self.assertIsNotNone(attempt.completed_at)
        self.assertEqual(attempt.score, 85.0)
        
        # Verify analytics integration
        records = AssessmentRecord.objects.filter(user=self.user)
        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first().score_change, 0.85) # 85 / 100
