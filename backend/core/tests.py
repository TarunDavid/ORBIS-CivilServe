from django.test import TestCase
from django.contrib.auth.models import User

from core.models import Role, Competency, RoleCompetency, UserProfile, Job


class RoleModelTests(TestCase):
    def test_create_role(self):
        role = Role.objects.create(name='Test Role', domain='Test')
        self.assertEqual(str(role), 'Test Role')

    def test_role_unique_name(self):
        Role.objects.create(name='Unique Role')
        with self.assertRaises(Exception):
            Role.objects.create(name='Unique Role')


class CompetencyModelTests(TestCase):
    def test_create_competency(self):
        comp = Competency.objects.create(name='Test Competency', domain='Test')
        self.assertEqual(str(comp), 'Test Competency')


class RoleCompetencyTests(TestCase):
    def setUp(self):
        self.role = Role.objects.create(name='Officer', domain='Stats')
        self.comp = Competency.objects.create(name='SQL', domain='IT')

    def test_create_mapping(self):
        mapping = RoleCompetency.objects.create(
            role=self.role, competency=self.comp, required_level=3
        )
        self.assertEqual(mapping.required_level, 3)
        self.assertIn('SQL', str(mapping))

    def test_unique_together(self):
        RoleCompetency.objects.create(role=self.role, competency=self.comp, required_level=3)
        with self.assertRaises(Exception):
            RoleCompetency.objects.create(role=self.role, competency=self.comp, required_level=4)


class UserProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')

    def test_create_profile(self):
        profile = UserProfile.objects.create(
            user=self.user, role='learner', department='Test Dept'
        )
        self.assertEqual(profile.role, 'learner')
        self.assertIn('testuser', str(profile))

    def test_profile_role_choices(self):
        profile = UserProfile.objects.create(user=self.user, role='admin')
        self.assertEqual(profile.get_role_display(), 'Admin')


class JobModelTests(TestCase):
    def test_create_job(self):
        job = Job.objects.create(
            task_name='core.services.example_task',
            args={'key': 'value'},
        )
        self.assertEqual(job.status, 'pending')
        self.assertIn('pending', str(job))


class SeedOrbisTests(TestCase):
    """Test that seed_orbis is idempotent."""

    def test_seed_idempotent(self):
        from django.core.management import call_command
        from io import StringIO

        out = StringIO()
        call_command('seed_orbis', stdout=out)
        first_run = out.getvalue()

        # Count created objects
        roles_1 = Role.objects.count()
        comps_1 = Competency.objects.count()
        users_1 = User.objects.count()

        # Run again
        out2 = StringIO()
        call_command('seed_orbis', stdout=out2)

        # Counts should be identical
        self.assertEqual(Role.objects.count(), roles_1)
        self.assertEqual(Competency.objects.count(), comps_1)
        self.assertEqual(User.objects.count(), users_1)


class AuthViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testlogin', password='testpass')
        UserProfile.objects.create(user=self.user, role='learner')

    def test_login_success(self):
        resp = self.client.post('/api/core/login/', {
            'username': 'testlogin', 'password': 'testpass'
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['profile']['role'], 'learner')

    def test_login_bad_password(self):
        resp = self.client.post('/api/core/login/', {
            'username': 'testlogin', 'password': 'wrong'
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_me_authenticated(self):
        self.client.login(username='testlogin', password='testpass')
        resp = self.client.get('/api/core/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['username'], 'testlogin')

    def test_me_unauthenticated(self):
        resp = self.client.get('/api/core/me/')
        self.assertEqual(resp.status_code, 401)
