from django.test import TestCase
from django.contrib.auth.models import User
from unittest.mock import patch
from assistant.models import Thread, Message

class AssistantTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='chatuser', password='pass')

    @patch('assistant.services.rag.RAGService.retrieve_context')
    @patch('ai_engine.services.LLMService.chat')
    def test_chat_endpoint(self, mock_llm, mock_rag):
        mock_rag.return_value = "[Retrieved Context]:\n--- Document 1 ---\nTest doc"
        mock_llm.return_value = {
            'choices': [{'message': {'content': 'This is the AI answer.'}}]
        }
        
        self.client.login(username='chatuser', password='pass')
        
        # Create thread
        resp = self.client.post('/api/assistant/threads/', {'title': 'Test Thread'})
        self.assertEqual(resp.status_code, 201)
        thread_id = resp.json()['id']
        
        # Send message
        resp = self.client.post(f'/api/assistant/threads/{thread_id}/chat/', {
            'content': 'What is the answer?'
        }, content_type='application/json')
        
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['content'], 'This is the AI answer.')
        self.assertEqual(resp.json()['role'], 'assistant')
        
        # Check DB
        thread = Thread.objects.get(id=thread_id)
        self.assertEqual(thread.messages.count(), 2) # 1 user, 1 assistant
        self.assertEqual(thread.messages.first().content, 'What is the answer?')
        self.assertEqual(thread.messages.last().content, 'This is the AI answer.')
