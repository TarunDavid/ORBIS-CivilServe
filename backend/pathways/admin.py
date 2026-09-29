from django.contrib import admin
from .models import LearningPath, PathNode

class PathNodeInline(admin.TabularInline):
    model = PathNode
    extra = 0
    fields = ('title', 'level', 'status')

@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('target_competency', 'generated_at')
    inlines = [PathNodeInline]

@admin.register(PathNode)
class PathNodeAdmin(admin.ModelAdmin):
    list_display = ('title', 'path', 'level', 'status')
    list_filter = ('level', 'status', 'path__target_competency')
    filter_horizontal = ('prerequisites',)
