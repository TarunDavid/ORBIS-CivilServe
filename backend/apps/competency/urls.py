from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompetencyCategoryViewSet, CompetencyViewSet, RoleRequirementViewSet

router = DefaultRouter()
router.register(r'categories', CompetencyCategoryViewSet)
router.register(r'list', CompetencyViewSet, basename='competency')
router.register(r'requirements', RoleRequirementViewSet, basename='requirement')

urlpatterns = [
    path('', include(router.urls)),
]
