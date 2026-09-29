"""
run_worker — Simple DB-backed job worker.

Polls the Job table for pending tasks, runs them one at a time.
No Celery/Redis needed.

Usage:
  python manage.py run_worker                # run continuously
  python manage.py run_worker --once         # process one job and exit
  python manage.py run_worker --poll-interval 5  # poll every 5 seconds
"""

import importlib
import time
import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Job

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process pending jobs from the Job table.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--once', action='store_true',
            help='Process one job and exit instead of running continuously.'
        )
        parser.add_argument(
            '--poll-interval', type=int, default=3,
            help='Seconds between polls for new jobs (default: 3).'
        )

    def handle(self, *args, **options):
        run_once = options['once']
        poll_interval = options['poll_interval']

        self.stdout.write(self.style.NOTICE(
            f"ORBIS Worker started (poll_interval={poll_interval}s, once={run_once})"
        ))

        while True:
            job = Job.objects.filter(status='pending').order_by('created_at').first()
            if job:
                self._process_job(job)
                if run_once:
                    break
            else:
                if run_once:
                    self.stdout.write('No pending jobs.')
                    break
                time.sleep(poll_interval)

    def _process_job(self, job: Job):
        """Execute a single job by importing and calling the task function."""
        self.stdout.write(f'Processing Job #{job.pk}: {job.task_name}')
        job.status = 'running'
        job.started_at = timezone.now()
        job.save(update_fields=['status', 'started_at'])

        try:
            # Import the task function from dotted path
            module_path, func_name = job.task_name.rsplit('.', 1)
            module = importlib.import_module(module_path)
            task_func = getattr(module, func_name)

            # Call with stored kwargs
            result = task_func(**(job.args or {}))

            job.status = 'completed'
            job.result = result if isinstance(result, (dict, list, str, int, float, bool, type(None))) else str(result)
            job.finished_at = timezone.now()
            job.save(update_fields=['status', 'result', 'finished_at'])
            self.stdout.write(self.style.SUCCESS(f'  Job #{job.pk} completed.'))

        except Exception as e:
            logger.exception(f'Job #{job.pk} failed: {e}')
            job.status = 'failed'
            job.result = {'error': str(e)}
            job.finished_at = timezone.now()
            job.save(update_fields=['status', 'result', 'finished_at'])
            self.stdout.write(self.style.ERROR(f'  Job #{job.pk} failed: {e}'))
