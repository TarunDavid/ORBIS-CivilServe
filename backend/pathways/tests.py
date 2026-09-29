from django.test import TestCase
from django.contrib.auth.models import User
from unittest.mock import patch
from core.models import Competency
from pathways.models import LearningPath, PathNode
from pathways.services.generator import PathwayGenerator

class PathwaysTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='pathuser', password='pass')
        self.comp = Competency.objects.create(name='Data Visualization', domain='Stats')

    @patch('ai_engine.services.LLMService.generate_json')
    def test_generator(self, mock_generate):
        mock_generate.return_value = {
            "nodes": [
                {"title": "Foundational Basics", "description": "Intro", "level": 1, "prerequisites": []},
                {"title": "Intermediate", "description": "Applying", "level": 2, "prerequisites": ["Foundational Basics"]},
                {"title": "Advanced Mastery", "description": "Expert", "level": 3, "prerequisites": ["Intermediate"]}
            ]
        }
        
        path = PathwayGenerator.generate_path(self.comp.id)
        
        self.assertEqual(path.target_competency, self.comp)
        
        nodes = path.nodes.all()
        self.assertEqual(nodes.count(), 3)
        
        foundational = nodes.get(title='Foundational Basics')
        intermediate = nodes.get(title='Intermediate')
        advanced = nodes.get(title='Advanced Mastery')
        
        self.assertEqual(foundational.level, 1)
        self.assertEqual(foundational.prerequisites.count(), 0)
        
        self.assertEqual(intermediate.level, 2)
        self.assertEqual(intermediate.prerequisites.count(), 1)
        self.assertIn(foundational, intermediate.prerequisites.all())

        self.assertEqual(advanced.level, 3)
        self.assertEqual(advanced.prerequisites.count(), 1)
        self.assertIn(intermediate, advanced.prerequisites.all())

    @patch('ai_engine.services.LLMService.generate_json')
    def test_api_generate(self, mock_generate):
        mock_generate.return_value = {
            "nodes": [
                {"title": "1", "level": 1, "prerequisites": []},
                {"title": "2", "level": 2, "prerequisites": ["1"]},
                {"title": "3", "level": 3, "prerequisites": ["2"]}
            ]
        }
        
        self.client.login(username='pathuser', password='pass')
        
        resp = self.client.post('/api/pathways/paths/generate/', {
            'competency_id': self.comp.id
        }, content_type='application/json')
        
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['target_competency']['name'], 'Data Visualization')
        self.assertEqual(len(resp.json()['nodes']), 3)

        # Idempotent return of same path
        resp2 = self.client.post('/api/pathways/paths/generate/', {
            'competency_id': self.comp.id
        }, content_type='application/json')
        self.assertEqual(resp2.status_code, 201)
        self.assertEqual(resp.json()['id'], resp2.json()['id'])
