"""
ORBIS Accounts — Tests
========================
Tests for auth, JWT, RBAC, permissions, and API contracts.
"""

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from .models import OfficialProfile, Department, JobRole


class AccountsModelTests(TestCase):
    """Test OfficialProfile, Department, and JobRole models."""

    def setUp(self):
        self.dept = Department.objects.create(code="TST", name="Test Department")
        self.job_role = JobRole.objects.create(
            code="TO", title="Test Officer", level="entry", department=self.dept
        )
        self.user = User.objects.create_user(
            username="test.user", password="testpass123"
        )

    def test_create_official_profile(self):
        profile = OfficialProfile.objects.create(
            user=self.user,
            role="official",
            department=self.dept,
            job_role=self.job_role,
            employee_id="TST-001",
        )
        self.assertEqual(profile.role, "official")
        self.assertTrue(profile.is_official)
        self.assertFalse(profile.is_trainer)
        self.assertFalse(profile.is_orbis_admin)

    def test_create_trainer_profile(self):
        profile = OfficialProfile.objects.create(
            user=self.user, role="trainer", employee_id="TST-002"
        )
        self.assertTrue(profile.is_trainer)
        self.assertFalse(profile.is_official)

    def test_create_admin_profile(self):
        profile = OfficialProfile.objects.create(
            user=self.user, role="admin", employee_id="TST-003"
        )
        self.assertTrue(profile.is_orbis_admin)

    def test_department_str(self):
        self.assertEqual(str(self.dept), "TST — Test Department")

    def test_job_role_str(self):
        self.assertEqual(str(self.job_role), "Test Officer (TO)")

    def test_profile_uuid_pk(self):
        profile = OfficialProfile.objects.create(
            user=self.user, role="official", employee_id="TST-004"
        )
        self.assertIsNotNone(profile.id)
        self.assertEqual(len(str(profile.id)), 36)


class AuthAPITests(TestCase):
    """Test login, SSO, JWT, and /api/me endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(code="CSO", name="Central Statistics Office")
        self.job_role = JobRole.objects.create(
            code="SO", title="Statistical Officer", level="entry", department=self.dept
        )
        self.user = User.objects.create_user(
            username="arjun.test",
            password="orbis2026",
            first_name="Arjun",
            last_name="Test",
        )
        self.profile = OfficialProfile.objects.create(
            user=self.user,
            role="official",
            department=self.dept,
            job_role=self.job_role,
            employee_id="CSO-TEST-001",
        )

    def test_login_success(self):
        response = self.client.post("/api/accounts/login/", {
            "username": "arjun.test",
            "password": "orbis2026",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["role"], "official")

    def test_login_invalid_credentials(self):
        response = self.client.post("/api/accounts/login/", {
            "username": "arjun.test",
            "password": "wrongpassword",
        })
        self.assertEqual(response.status_code, 401)

    def test_login_missing_fields(self):
        response = self.client.post("/api/accounts/login/", {})
        self.assertEqual(response.status_code, 400)

    def test_login_no_orbis_profile(self):
        """User without OfficialProfile should get 403."""
        User.objects.create_user(username="no.profile", password="pass123")
        response = self.client.post("/api/accounts/login/", {
            "username": "no.profile",
            "password": "pass123",
        })
        self.assertEqual(response.status_code, 403)

    def test_mock_sso_by_employee_id(self):
        response = self.client.post("/api/accounts/sso/", {
            "sso_token": "CSO-TEST-001",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access", data)
        self.assertEqual(data["user"]["role"], "official")

    def test_mock_sso_by_username(self):
        response = self.client.post("/api/accounts/sso/", {
            "sso_token": "arjun.test",
        })
        self.assertEqual(response.status_code, 200)

    def test_mock_sso_not_found(self):
        response = self.client.post("/api/accounts/sso/", {
            "sso_token": "nonexistent",
        })
        self.assertEqual(response.status_code, 401)

    def test_me_endpoint_authenticated(self):
        # Login first
        login_resp = self.client.post("/api/accounts/login/", {
            "username": "arjun.test",
            "password": "orbis2026",
        })
        token = login_resp.json()["access"]

        # Access /api/me with JWT
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        # Verify frozen contract shape
        self.assertIn("id", data)
        self.assertIn("role", data)
        self.assertIn("department", data)
        self.assertIn("job_role_id", data)
        self.assertEqual(data["role"], "official")
        self.assertEqual(data["department"], "CSO")

    def test_me_endpoint_unauthenticated(self):
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 401)

    def test_jwt_token_refresh(self):
        login_resp = self.client.post("/api/accounts/login/", {
            "username": "arjun.test",
            "password": "orbis2026",
        })
        refresh = login_resp.json()["refresh"]

        response = self.client.post("/api/accounts/token/refresh/", {
            "refresh": refresh,
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())

    def test_token_refresh_invalid(self):
        response = self.client.post("/api/accounts/token/refresh/", {
            "refresh": "invalid-token",
        })
        self.assertEqual(response.status_code, 401)


class RBACPermissionTests(TestCase):
    """Test role-based access control."""

    def setUp(self):
        self.client = APIClient()

        u1 = User.objects.create_user(username="rbac.official", password="pass")
        OfficialProfile.objects.create(user=u1, role="official", employee_id="RBAC-001")

        u2 = User.objects.create_user(username="rbac.trainer", password="pass")
        OfficialProfile.objects.create(user=u2, role="trainer", employee_id="RBAC-002")

        u3 = User.objects.create_user(username="rbac.admin", password="pass")
        OfficialProfile.objects.create(user=u3, role="admin", employee_id="RBAC-003")

    def _get_token(self, username):
        resp = self.client.post("/api/accounts/login/", {
            "username": username, "password": "pass",
        })
        return resp.json()["access"]

    def test_official_can_access_me(self):
        token = self._get_token("rbac.official")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.get("/api/me")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["role"], "official")

    def test_trainer_can_access_me(self):
        token = self._get_token("rbac.trainer")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.get("/api/me")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["role"], "trainer")

    def test_admin_can_access_me(self):
        token = self._get_token("rbac.admin")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.get("/api/me")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["role"], "admin")
