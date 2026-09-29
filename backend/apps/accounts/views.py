"""
ORBIS Accounts — Views
=======================
Authentication endpoints: login, mock SSO, current user, logout.
Uses OfficialProfile (OneToOne to auth.User) — no AUTH_USER_MODEL swap.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OfficialProfile
from .serializers import (
    CurrentUserSerializer,
    LoginSerializer,
    MockSSOSerializer,
    UserFullSerializer,
)


def _get_profile_user(user):
    """Select-related fetch of user with orbis_profile."""
    try:
        return User.objects.select_related(
            "orbis_profile",
            "orbis_profile__department",
            "orbis_profile__job_role",
        ).get(pk=user.pk)
    except User.DoesNotExist:
        return user


def _generate_tokens(user):
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    profile = getattr(user, "orbis_profile", None)
    if profile:
        refresh["role"] = profile.role
        refresh["department"] = profile.department.code if profile.department else None
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Username/password login → JWT tokens.
    POST /api/accounts/login/
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        username=serializer.validated_data["username"],
        password=serializer.validated_data["password"],
    )
    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Ensure user has an ORBIS profile
    if not hasattr(user, "orbis_profile"):
        try:
            OfficialProfile.objects.get(user=user)
        except OfficialProfile.DoesNotExist:
            return Response(
                {"error": "No ORBIS profile found for this user"},
                status=status.HTTP_403_FORBIDDEN,
            )

    user = _get_profile_user(user)
    tokens = _generate_tokens(user)
    return Response(
        {
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": CurrentUserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def mock_sso_view(request):
    """
    Mock OIDC/SSO login — simulates receiving a token from an SSO provider.
    Accepts employee_id or username as the sso_token and returns JWT tokens.

    POST /api/accounts/sso/
    """
    serializer = MockSSOSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    sso_token = serializer.validated_data["sso_token"]

    # Try to find user by employee_id first, then by username
    profile = OfficialProfile.objects.filter(employee_id=sso_token).select_related(
        "user", "department", "job_role"
    ).first()

    if profile is None:
        # Try by username
        try:
            user = User.objects.get(username=sso_token)
            profile = OfficialProfile.objects.filter(user=user).select_related(
                "department", "job_role"
            ).first()
        except User.DoesNotExist:
            profile = None

    if profile is None:
        return Response(
            {"error": "SSO authentication failed — user not found"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = _get_profile_user(profile.user)
    tokens = _generate_tokens(user)
    return Response(
        {
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": CurrentUserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Current user endpoint — frozen contract.
    GET /api/me
    Returns: { id, role, department, job_role_id }
    """
    user = _get_profile_user(request.user)
    if not hasattr(user, "orbis_profile"):
        return Response(
            {"error": "No ORBIS profile found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(CurrentUserSerializer(user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_full_view(request):
    """
    Full current user profile.
    GET /api/accounts/me/full/
    """
    user = _get_profile_user(request.user)
    if not hasattr(user, "orbis_profile"):
        return Response(
            {"error": "No ORBIS profile found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(UserFullSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Blacklist the refresh token to log out.
    POST /api/accounts/logout/
    """
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass  # Token might already be blacklisted or invalid

    return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """
    Refresh an access token using a valid refresh token.
    POST /api/accounts/token/refresh/
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        token = RefreshToken(refresh_token)
        return Response(
            {"access": str(token.access_token)},
            status=status.HTTP_200_OK,
        )
    except Exception:
        return Response(
            {"error": "Invalid or expired refresh token"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
