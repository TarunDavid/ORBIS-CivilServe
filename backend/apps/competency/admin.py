from django.contrib import admin
from .models import CompetencyCategory, Competency, RoleRequirement

@admin.register(CompetencyCategory)
class CompetencyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'code')


@admin.register(RoleRequirement)
class RoleRequirementAdmin(admin.ModelAdmin):
    list_display = ('job_role', 'competency', 'target_proficiency', 'weight')
    list_filter = ('job_role', 'target_proficiency')
    search_fields = ('job_role__title', 'competency__name')
