import os
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch
from content.models import Material, ExtractedChunk
from core.models import Job

class ContentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='contentuser', password='pass')

    @patch('ai_engine.services.EmbeddingService.get_instance')
    def test_pdf_extraction(self, mock_embedder):
        # Mock embedding return
        mock_embedder.return_value.encode.return_value = [0.1, 0.2, 0.3]
        
        # Create a dummy pdf file
        dummy_file = SimpleUploadedFile("test.pdf", b"dummy content", content_type="application/pdf")
        
        self.client.login(username='contentuser', password='pass')
        resp = self.client.post('/api/content/materials/', {
            'title': 'Test PDF',
            'material_type': 'pdf',
            'file': dummy_file
        })
        
        self.assertEqual(resp.status_code, 201)
        material_id = resp.json()['id']
        
        # Check Job was created
        job = Job.objects.filter(task_name='content.services.extraction.process_material').first()
        self.assertIsNotNone(job)
        self.assertEqual(job.args['material_id'], material_id)
        
        # Execute the extraction logic directly
        from content.services.extraction import process_material
        res = process_material(material_id)
        
        self.assertIn('Processed 1 chunks', res)
        
        material = Material.objects.get(id=material_id)
        self.assertEqual(material.status, 'ready')
        self.assertEqual(material.chunks.count(), 1)
        
        chunk = material.chunks.first()
        self.assertIn("Simulated extracted text from PDF", chunk.content)
        self.assertIsNotNone(chunk.embedding_blob)

    @patch('ai_engine.services.STTService.get_instance')
    @patch('ai_engine.services.EmbeddingService.get_instance')
    def test_video_extraction(self, mock_embedder, mock_stt):
        mock_embedder.return_value.encode.return_value = [0.1, 0.2, 0.3]
        
        # Mock whisper segments generator
        class MockSegment:
            def __init__(self, text, start, end):
                self.text = text
                self.start = start
                self.end = end
                
        mock_stt.return_value.transcribe.return_value = (
            [MockSegment("Hello", 0.0, 2.0), MockSegment("World", 2.0, 4.0)],
            {} # info dict
        )
        
        dummy_file = SimpleUploadedFile("test.mp4", b"dummy video", content_type="video/mp4")
        
        material = Material.objects.create(
            title='Test Video',
            material_type='video',
            file=dummy_file
        )
        
        from content.services.extraction import process_material
        res = process_material(material.id)
        
        self.assertIn('Processed 2 chunks', res)
        self.assertEqual(material.chunks.count(), 2)
        
        chunks = material.chunks.all()
        self.assertEqual(chunks[0].content, "Hello")
        self.assertEqual(chunks[1].content, "World")
