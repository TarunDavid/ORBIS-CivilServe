from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScenarioViewSet, ScenarioAttemptViewSet

router = DefaultRouter()
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'attempts', ScenarioAttemptViewSet, basename='attempt')

urlpatterns = [
    path('', include(router.urls)),
]
