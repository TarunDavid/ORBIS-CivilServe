"""
URL configuration for educarnival project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/ai/', include('ai_engine.urls')),
    # Dev A (MEASURE side) endpoints
    path('api/me', include([
        path('', __import__('apps.accounts.views', fromlist=['me_view']).me_view, name='api-me'),
    ])),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/competency/', include('apps.competency.urls')),
    path('api/evidence/', include('apps.evidence.urls')),
    path('api/labs/', include('apps.labs.urls')),
    path('api/users/<str:user_id>/competency-card/', __import__('apps.competency.views', fromlist=['UserCompetencyCardView']).UserCompetencyCardView.as_view(), name='user-competency-card'),
    
    # ORBIS Competency Platform
    path('api/core/', include('core.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/pathways/', include('pathways.urls')),
    path('api/content/', include('content.urls')),
    path('api/assistant/', include('assistant.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/virtual_lab/', include('virtual_lab.urls')),
    path('api/edge/', include('edge.urls')),
]

from django.urls import re_path
from api.media_views import serve_media_with_range

if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_with_range),
    ]
