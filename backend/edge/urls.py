from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeviceSyncStateViewSet

router = DefaultRouter()
router.register(r'devices', DeviceSyncStateViewSet, basename='device')

urlpatterns = [
    path('', include(router.urls)),
]
