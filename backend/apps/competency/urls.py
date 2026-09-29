from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompetencyCategoryViewSet, 
    CompetencyViewSet, 
    RoleRequirementViewSet,
    CompetencyCardView
)

router = DefaultRouter()
router.register(r'categories', CompetencyCategoryViewSet)
router.register(r'list', CompetencyViewSet, basename='competency')
router.register(r'requirements', RoleRequirementViewSet, basename='requirement')

urlpatterns = [
    path('card/me/', CompetencyCardView.as_view(), name='my-competency-card'),
    path('card/<uuid:official_id>/', CompetencyCardView.as_view(), name='official-competency-card'),
    path('', include(router.urls)),
]
