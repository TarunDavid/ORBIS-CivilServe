from django.urls import path
from .views import LoginView, LogoutView, MeView

urlpatterns = [
    path('login/', LoginView.as_view(), name='core-login'),
    path('logout/', LogoutView.as_view(), name='core-logout'),
    path('me/', MeView.as_view(), name='core-me'),
]
