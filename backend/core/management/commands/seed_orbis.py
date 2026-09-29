"""
seed_orbis — Idempotent seed for the ORBIS Competency Platform.

Seeds:
  - 1 Role ("Statistical Officer")
  - ~10 Competencies (statistics domain)
  - RoleCompetency mappings
  - 3 demo users (learner, trainer, admin) with UserProfiles

Usage:
  python manage.py seed_orbis          # run (idempotent)
  python manage.py seed_orbis --demo   # extended demo dataset (Step 9)
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from core.models import Role, Competency, RoleCompetency, UserProfile


COMPETENCIES = [
    {
        'name': 'Survey Design',
        'domain': 'Statistical Methods',
        'description': 'Designing representative surveys, questionnaire construction, sampling frames.',
    },
    {
        'name': 'Sampling Techniques',
        'domain': 'Statistical Methods',
        'description': 'Probability and non-probability sampling, stratified, cluster, and multi-stage sampling.',
    },
    {
        'name': 'Data Collection & Fieldwork',
        'domain': 'Statistical Methods',
        'description': 'CAPI/CATI/CAWI methodologies, field supervision, data quality checks.',
    },
    {
        'name': 'Data Cleaning & Validation',
        'domain': 'Data Management',
        'description': 'Identifying and handling outliers, missing data, consistency checks, edit rules.',
    },
    {
        'name': 'SQL for Data Analysis',
        'domain': 'IT Skills',
        'description': 'Writing SQL queries for aggregation, joins, window functions on statistical databases.',
    },
    {
        'name': 'Python for Statistics',
        'domain': 'IT Skills',
        'description': 'Using pandas, numpy, scipy for data manipulation, statistical testing, and automation.',
    },
    {
        'name': 'Data Visualisation',
        'domain': 'IT Skills',
        'description': 'Creating effective charts, dashboards, and reports using matplotlib, Plotly, or Excel.',
    },
    {
        'name': 'Descriptive & Inferential Statistics',
        'domain': 'Statistical Methods',
        'description': 'Measures of central tendency, dispersion, hypothesis testing, confidence intervals.',
    },
    {
        'name': 'NSS/MoSPI Standards & Procedures',
        'domain': 'Domain Knowledge',
        'description': 'National Statistical System procedures, survey rounds, NSSO methodology, CPI computation.',
    },
    {
        'name': 'Official Statistics Dissemination',
        'domain': 'Domain Knowledge',
        'description': 'Data release policies, statistical reports, metadata standards (SDMX), open data.',
    },
]

ROLE_COMPETENCY_LEVELS = {
    'Survey Design': 4,
    'Sampling Techniques': 4,
    'Data Collection & Fieldwork': 3,
    'Data Cleaning & Validation': 4,
    'SQL for Data Analysis': 3,
    'Python for Statistics': 3,
    'Data Visualisation': 3,
    'Descriptive & Inferential Statistics': 4,
    'NSS/MoSPI Standards & Procedures': 4,
    'Official Statistics Dissemination': 3,
}

DEMO_USERS = [
    {
        'username': 'learner',
        'password': 'orbis2026',
        'role': 'learner',
        'department': 'Field Operations Division',
        'preferred_language': 'en',
    },
    {
        'username': 'trainer',
        'password': 'orbis2026',
        'role': 'trainer',
        'department': 'Training Division',
        'preferred_language': 'en',
    },
    {
        'username': 'admin',
        'password': 'orbis2026',
        'role': 'admin',
        'department': 'MoSPI Headquarters',
        'preferred_language': 'en',
    },
]


class Command(BaseCommand):
    help = 'Seed ORBIS competency platform with roles, competencies, and demo users (idempotent).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--demo', action='store_true',
            help='Seed extended demo dataset (30 learners, 4 departments).'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding ORBIS platform data...'))

        # 1. Role
        role, created = Role.objects.get_or_create(
            name='Statistical Officer',
            defaults={
                'description': 'Officer in the Official Statistical System responsible for survey operations, data processing, and statistical analysis.',
                'domain': 'Statistics',
            }
        )
        action = 'Created' if created else 'Exists'
        self.stdout.write(f'  Role: {role.name} [{action}]')

        # 2. Competencies
        competency_objs = {}
        for comp_data in COMPETENCIES:
            comp, created = Competency.objects.get_or_create(
                name=comp_data['name'],
                defaults={
                    'description': comp_data['description'],
                    'domain': comp_data['domain'],
                }
            )
            competency_objs[comp.name] = comp
            action = 'Created' if created else 'Exists'
            self.stdout.write(f'  Competency: {comp.name} [{action}]')

        # 3. RoleCompetency mappings
        for comp_name, level in ROLE_COMPETENCY_LEVELS.items():
            comp = competency_objs.get(comp_name)
            if comp:
                _, created = RoleCompetency.objects.get_or_create(
                    role=role,
                    competency=comp,
                    defaults={'required_level': level},
                )
                if created:
                    self.stdout.write(f'  Mapping: {role.name} → {comp.name} (L{level}) [Created]')

        # 4. Demo users
        for user_data in DEMO_USERS:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'is_staff': user_data['role'] == 'admin',
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'  User: {user.username} [Created]')
            else:
                self.stdout.write(f'  User: {user.username} [Exists]')

            profile, p_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': user_data['role'],
                    'department': user_data['department'],
                    'preferred_language': user_data['preferred_language'],
                    'assigned_role': role if user_data['role'] == 'learner' else None,
                }
            )
            if p_created:
                self.stdout.write(f'  Profile: {profile} [Created]')

        if options.get('demo'):
            self.stdout.write(self.style.NOTICE('Extended --demo dataset will be added in Step 9.'))

        self.stdout.write(self.style.SUCCESS('ORBIS seed complete.'))
