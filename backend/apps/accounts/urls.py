"""
ORBIS Accounts — URL Configuration
====================================
"""

from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("sso/", views.mock_sso_view, name="mock-sso"),
    path("logout/", views.logout_view, name="logout"),
    path("me/full/", views.me_full_view, name="me-full"),
    path("token/refresh/", views.token_refresh_view, name="token-refresh"),
]
