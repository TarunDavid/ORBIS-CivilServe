from django.contrib import admin
from .models import Scenario, ScenarioAttempt

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('title', 'competency')

@admin.register(ScenarioAttempt)
class ScenarioAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'scenario', 'score', 'created_at', 'completed_at')
