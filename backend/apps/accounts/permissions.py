"""
ORBIS Accounts — Permissions
============================
Custom DRF permissions for role-based access control.
Checks the user's OfficialProfile for ORBIS role.
"""

from rest_framework.permissions import BasePermission


def _get_orbis_role(user):
    """Safely get the ORBIS role from the user's profile."""
    if not user or not user.is_authenticated:
        return None
    profile = getattr(user, "orbis_profile", None)
    if profile is None:
        return None
    return profile.role


class IsOrbisAuthenticated(BasePermission):
    """Requires a valid JWT-authenticated user WITH an ORBIS profile."""
    def has_permission(self, request, view):
        return _get_orbis_role(request.user) is not None


class IsOfficialOrAbove(BasePermission):
    """Any authenticated ORBIS user (official, trainer, or admin)."""
    def has_permission(self, request, view):
        role = _get_orbis_role(request.user)
        return role in ("official", "trainer", "admin")


class IsTrainerOrAdmin(BasePermission):
    """Only trainers and administrators."""
    def has_permission(self, request, view):
        role = _get_orbis_role(request.user)
        return role in ("trainer", "admin")


class IsAdmin(BasePermission):
    """Only ORBIS administrators."""
    def has_permission(self, request, view):
        role = _get_orbis_role(request.user)
        return role == "admin"


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: user can only access their own objects,
    unless they are an admin.
    Expects the object to have a 'user' attribute or 'user_id' field.
    """
    def has_object_permission(self, request, view, obj):
        role = _get_orbis_role(request.user)
        if role is None:
            return False
        if role == "admin":
            return True
        obj_user = getattr(obj, "user", None)
        if obj_user is not None:
            return obj_user == request.user
        obj_user_id = getattr(obj, "user_id", None)
        if obj_user_id is not None:
            return str(obj_user_id) == str(request.user.id)
        return False
