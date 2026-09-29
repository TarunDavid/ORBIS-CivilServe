from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompetencyLabViewSet, LabSessionViewSet

router = DefaultRouter()
router.register(r'catalogs', CompetencyLabViewSet, basename='lab')
router.register(r'sessions', LabSessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
]
