import json
import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from django.conf import settings
from django.utils import timezone
from core.models import Competency
from catalog.models import Course, SyncLog

class CatalogProvider(ABC):
    @abstractmethod
    def fetch_courses(self) -> List[Dict[str, Any]]:
        """Fetch courses from the external provider."""
        pass

    @property
    @abstractmethod
    def provider_id(self) -> str:
        pass


class MockJsonProvider(CatalogProvider):
    """Base class for mock providers that read from JSON fixtures."""
    def __init__(self, filename: str, provider_id: str):
        self.filename = filename
        self._provider_id = provider_id

    @property
    def provider_id(self) -> str:
        return self._provider_id

    def fetch_courses(self) -> List[Dict[str, Any]]:
        filepath = os.path.join(
            settings.BASE_DIR, 'catalog', 'fixtures', self.filename
        )
        if not os.path.exists(filepath):
            return []
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)


class IGotMockProvider(MockJsonProvider):
    def __init__(self):
        super().__init__('igot_courses.json', 'igot')


class TpacMockProvider(MockJsonProvider):
    def __init__(self):
        super().__init__('tpac_courses.json', 'tpac')


class SyncService:
    @staticmethod
    def sync_provider(provider: CatalogProvider):
        """Syncs courses from a given provider into the local DB."""
        log = SyncLog.objects.create(provider=provider.provider_id)
        
        try:
            courses_data = provider.fetch_courses()
            added = 0
            updated = 0
            
            for item in courses_data:
                course, created = Course.objects.update_or_create(
                    provider=provider.provider_id,
                    external_id=item['id'],
                    defaults={
                        'title': item.get('title', ''),
                        'description': item.get('description', ''),
                        'source_url': item.get('url', ''),
                        'duration_minutes': item.get('duration_minutes', 0),
                    }
                )
                
                # Map competencies
                comp_names = item.get('competencies', [])
                if comp_names:
                    comps = Competency.objects.filter(name__in=comp_names)
                    course.competencies.set(comps)
                
                if created:
                    added += 1
                else:
                    updated += 1
            
            log.courses_added = added
            log.courses_updated = updated
            log.finished_at = timezone.now()
            log.status = 'success'
            log.save()
            return log
            
        except Exception as e:
            log.status = 'error'
            log.error_message = str(e)
            log.finished_at = timezone.now()
            log.save()
            raise e
