from django.contrib import admin
from .models import CompetencyLab, LabSession

@admin.register(CompetencyLab)
class CompetencyLabAdmin(admin.ModelAdmin):
    list_display = ('title', 'competency', 'environment_type', 'is_active')
    list_filter = ('environment_type', 'is_active', 'competency')
    search_fields = ('title', 'description')

@admin.register(LabSession)
class LabSessionAdmin(admin.ModelAdmin):
    list_display = ('official', 'lab', 'status', 'llm_score_raw', 'created_at')
    list_filter = ('status', 'lab__environment_type')
    search_fields = ('official__user__username', 'lab__title')
    readonly_fields = ('created_at', 'completed_at')
