from django.contrib import admin
from .models import Material, ExtractedChunk

class ExtractedChunkInline(admin.TabularInline):
    model = ExtractedChunk
    extra = 0
    fields = ('content', 'start_time', 'end_time')
    readonly_fields = ('content', 'start_time', 'end_time')

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'material_type', 'status', 'node', 'uploaded_at')
    list_filter = ('material_type', 'status')
    search_fields = ('title',)
    # inlines = [ExtractedChunkInline] # Too heavy to load all chunks in admin

@admin.register(ExtractedChunk)
class ExtractedChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'material', 'start_time', 'end_time', 'created_at')
    list_filter = ('material',)
