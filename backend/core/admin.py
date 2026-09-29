from django.contrib import admin
from .models import Role, Competency, RoleCompetency, UserProfile, Job


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'domain', 'created_at']
    search_fields = ['name', 'domain']


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'domain', 'created_at']
    search_fields = ['name', 'domain']
    list_filter = ['domain']


@admin.register(RoleCompetency)
class RoleCompetencyAdmin(admin.ModelAdmin):
    list_display = ['role', 'competency', 'required_level']
    list_filter = ['role', 'required_level']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'department', 'preferred_language', 'assigned_role']
    list_filter = ['role', 'department']
    search_fields = ['user__username', 'department']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['id', 'task_name', 'status', 'created_at', 'started_at', 'finished_at']
    list_filter = ['status', 'task_name']
    readonly_fields = ['created_at', 'started_at', 'finished_at']
