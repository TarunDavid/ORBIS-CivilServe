from rest_framework import serializers
from .models import Course, Enrolment, SyncLog
from core.serializers import CompetencySerializer

class CourseSerializer(serializers.ModelSerializer):
    competencies = CompetencySerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'provider', 'external_id', 
            'source_url', 'duration_minutes', 'competencies', 'updated_at'
        ]

class EnrolmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrolment
        fields = [
            'id', 'course', 'status', 'progress_percent', 
            'enrolled_at', 'last_accessed_at', 'completed_at'
        ]
