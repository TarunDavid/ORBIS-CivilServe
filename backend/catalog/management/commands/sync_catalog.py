from django.core.management.base import BaseCommand
from catalog.services.providers import IGotMockProvider, TpacMockProvider, SyncService

class Command(BaseCommand):
    help = 'Synchronize catalog from external providers (iGOT, TPAC)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Catalog Sync...'))
        
        igot = IGotMockProvider()
        log_igot = SyncService.sync_provider(igot)
        self.stdout.write(self.style.SUCCESS(
            f"iGOT Sync: {log_igot.status}. Added: {log_igot.courses_added}, Updated: {log_igot.courses_updated}"
        ))

        tpac = TpacMockProvider()
        log_tpac = SyncService.sync_provider(tpac)
        self.stdout.write(self.style.SUCCESS(
            f"TPAC Sync: {log_tpac.status}. Added: {log_tpac.courses_added}, Updated: {log_tpac.courses_updated}"
        ))
        
        self.stdout.write(self.style.SUCCESS('Catalog Sync Complete.'))
