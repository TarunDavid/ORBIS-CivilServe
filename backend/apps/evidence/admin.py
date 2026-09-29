from django.contrib import admin
from .models import EvidenceRecord, OfficialCompetencyScore

@admin.register(EvidenceRecord)
class EvidenceRecordAdmin(admin.ModelAdmin):
    list_display = ('official', 'competency', 'source_type', 'score_raw', 'score_proficiency', 'timestamp')
    list_filter = ('source_type', 'competency', 'score_proficiency')
    search_fields = ('official__user__username', 'competency__name')
    readonly_fields = ('timestamp',)

@admin.register(OfficialCompetencyScore)
class OfficialCompetencyScoreAdmin(admin.ModelAdmin):
    list_display = ('official', 'competency', 'current_proficiency', 'last_updated')
    list_filter = ('current_proficiency', 'competency')
    search_fields = ('official__user__username', 'competency__name')
    readonly_fields = ('last_updated',)
