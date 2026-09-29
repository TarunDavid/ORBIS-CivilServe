from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrolmentViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrolments', EnrolmentViewSet, basename='enrolment')

urlpatterns = [
    path('', include(router.urls)),
]
