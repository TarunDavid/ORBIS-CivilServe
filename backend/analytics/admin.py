from django.contrib import admin
from .models import CompetencyScore, AssessmentRecord

@admin.register(CompetencyScore)
class CompetencyScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'competency', 'current_level', 'last_assessed')
    list_filter = ('competency', 'current_level')

@admin.register(AssessmentRecord)
class AssessmentRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'competency', 'score_change', 'reason', 'timestamp')
    list_filter = ('competency', 'reason')
