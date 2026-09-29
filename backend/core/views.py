from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .serializers import UserProfileSerializer


class LoginView(APIView):
    """Authenticate and return user profile with role info."""

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        if not username or not password:
            return Response(
                {'code': 'missing_credentials', 'message': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {'code': 'invalid_credentials', 'message': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)
        profile = UserProfile.objects.filter(user=user).first()
        if profile is None:
            return Response(
                {'code': 'no_profile', 'message': 'User exists but has no ORBIS profile.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({
            'user_id': user.id,
            'username': user.username,
            'profile': UserProfileSerializer(profile).data,
        })


class LogoutView(APIView):
    """Log out the current user."""

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out.'})


class MeView(APIView):
    """Return the current user's profile."""

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'code': 'not_authenticated', 'message': 'Not logged in.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        profile = UserProfile.objects.filter(user=request.user).first()
        if profile is None:
            return Response(
                {'code': 'no_profile', 'message': 'No ORBIS profile found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({
            'user_id': request.user.id,
            'username': request.user.username,
            'profile': UserProfileSerializer(profile).data,
        })
