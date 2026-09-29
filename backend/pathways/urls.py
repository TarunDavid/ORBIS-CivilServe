from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningPathViewSet

router = DefaultRouter()
router.register(r'paths', LearningPathViewSet, basename='learningpath')

urlpatterns = [
    path('', include(router.urls)),
]
