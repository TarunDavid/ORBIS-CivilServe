from django.contrib import admin
from .models import Course, Enrolment, SyncLog

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'external_id', 'duration_minutes')
    list_filter = ('provider',)
    search_fields = ('title', 'external_id')
    filter_horizontal = ('competencies',)

@admin.register(Enrolment)
class EnrolmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'progress_percent', 'enrolled_at')
    list_filter = ('status', 'course__provider')
    search_fields = ('user__username', 'course__title')

@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('provider', 'started_at', 'finished_at', 'courses_added', 'courses_updated', 'status')
    list_filter = ('provider', 'status')
