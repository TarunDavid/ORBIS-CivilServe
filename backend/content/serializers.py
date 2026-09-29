from rest_framework import serializers
from .models import Material

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'title', 'file', 'material_type', 'node', 'status', 'uploaded_at']
        read_only_fields = ['status', 'uploaded_at']
