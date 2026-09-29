"""
ORBIS Accounts — Admin Configuration
======================================
"""

from django.contrib import admin
from .models import OfficialProfile, Department, JobRole


@admin.register(OfficialProfile)
class OfficialProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "department", "job_role", "employee_id")
    list_filter = ("role", "department")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "employee_id")
    raw_id_fields = ("user",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("name", "code")


@admin.register(JobRole)
class JobRoleAdmin(admin.ModelAdmin):
    list_display = ("title", "code", "level", "department")
    list_filter = ("level", "department")
    search_fields = ("title", "code")
