"""
Management command: seed_accounts
===================================
Creates demo departments, job roles, and users for the ORBIS prototype.
Deterministic — safe to run multiple times (skips existing records).
"""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from apps.accounts.models import Department, JobRole, OfficialProfile


DEPARTMENTS = [
    {"code": "MOSPI", "name": "Ministry of Statistics and Programme Implementation"},
    {"code": "CSO", "name": "Central Statistics Office"},
    {"code": "NSSO", "name": "National Sample Survey Office"},
    {"code": "RGI", "name": "Registrar General of India"},
    {"code": "DES", "name": "Directorate of Economics and Statistics"},
]

JOB_ROLES = [
    {"code": "SO", "title": "Statistical Officer", "level": "entry", "dept_code": "CSO"},
    {"code": "SSO", "title": "Senior Statistical Officer", "level": "mid", "dept_code": "CSO"},
    {"code": "DSO", "title": "Deputy Statistical Officer", "level": "mid", "dept_code": "NSSO"},
    {"code": "DD", "title": "Deputy Director", "level": "senior", "dept_code": "MOSPI"},
    {"code": "DIR", "title": "Director", "level": "leadership", "dept_code": "MOSPI"},
    {"code": "JSA", "title": "Junior Statistical Assistant", "level": "entry", "dept_code": "DES"},
    {"code": "IO", "title": "Investigator Officer", "level": "entry", "dept_code": "NSSO"},
]

DEMO_USERS = [
    {
        "username": "arjun.sharma",
        "password": "orbis2026",
        "first_name": "Arjun",
        "last_name": "Sharma",
        "email": "arjun.sharma@mospi.gov.in",
        "role": "official",
        "dept_code": "CSO",
        "job_code": "SO",
        "employee_id": "CSO-2024-001",
        "designation": "Statistical Officer",
    },
    {
        "username": "priya.patel",
        "password": "orbis2026",
        "first_name": "Priya",
        "last_name": "Patel",
        "email": "priya.patel@mospi.gov.in",
        "role": "official",
        "dept_code": "NSSO",
        "job_code": "DSO",
        "employee_id": "NSSO-2022-015",
        "designation": "Deputy Statistical Officer",
    },
    {
        "username": "vikram.reddy",
        "password": "orbis2026",
        "first_name": "Vikram",
        "last_name": "Reddy",
        "email": "vikram.reddy@mospi.gov.in",
        "role": "trainer",
        "dept_code": "MOSPI",
        "job_code": "DD",
        "employee_id": "MOSPI-2018-042",
        "designation": "Deputy Director (Training)",
    },
    {
        "username": "orbis_admin",
        "password": "orbis2026",
        "first_name": "ORBIS",
        "last_name": "Admin",
        "email": "admin@orbis.gov.in",
        "role": "admin",
        "dept_code": "MOSPI",
        "job_code": "DIR",
        "employee_id": "MOSPI-ADMIN-001",
        "designation": "Platform Administrator",
    },
    {
        "username": "meera.iyer",
        "password": "orbis2026",
        "first_name": "Meera",
        "last_name": "Iyer",
        "email": "meera.iyer@des.gov.in",
        "role": "official",
        "dept_code": "DES",
        "job_code": "JSA",
        "employee_id": "DES-2025-003",
        "designation": "Junior Statistical Assistant",
    },
]


class Command(BaseCommand):
    help = "Seed demo departments, job roles, and users for ORBIS."

    def handle(self, *args, **options):
        self.stdout.write("Seeding ORBIS accounts...")

        # 1. Departments
        dept_map = {}
        for d in DEPARTMENTS:
            dept, created = Department.objects.get_or_create(
                code=d["code"],
                defaults={"name": d["name"]},
            )
            dept_map[d["code"]] = dept
            tag = "created" if created else "exists"
            self.stdout.write(f"  Department {d['code']}: {tag}")

        # 2. Job Roles
        role_map = {}
        for jr in JOB_ROLES:
            job, created = JobRole.objects.get_or_create(
                code=jr["code"],
                defaults={
                    "title": jr["title"],
                    "level": jr["level"],
                    "department": dept_map.get(jr["dept_code"]),
                },
            )
            role_map[jr["code"]] = job
            tag = "created" if created else "exists"
            self.stdout.write(f"  Job Role {jr['code']} ({jr['title']}): {tag}")

        # 3. Users + OfficialProfiles
        for u in DEMO_USERS:
            if User.objects.filter(username=u["username"]).exists():
                self.stdout.write(f"  User {u['username']}: exists")
                continue

            user = User.objects.create_user(
                username=u["username"],
                password=u["password"],
                email=u["email"],
                first_name=u["first_name"],
                last_name=u["last_name"],
            )

            OfficialProfile.objects.create(
                user=user,
                role=u["role"],
                department=dept_map.get(u["dept_code"]),
                job_role=role_map.get(u["job_code"]),
                employee_id=u["employee_id"],
                designation=u["designation"],
            )

            self.stdout.write(
                self.style.SUCCESS(f"  User {u['username']} ({u['role']}): created")
            )

        self.stdout.write(self.style.SUCCESS("\nAccounts seeding complete!"))
        self.stdout.write(
            "\nDemo credentials (all passwords: orbis2026):"
            "\n  arjun.sharma  — Official (Statistical Officer, CSO)"
            "\n  priya.patel   — Official (Deputy Statistical Officer, NSSO)"
            "\n  meera.iyer    — Official (Junior Statistical Assistant, DES)"
            "\n  vikram.reddy  — Trainer (Deputy Director, MOSPI)"
            "\n  orbis_admin   — Administrator"
            "\n\nSSO tokens (employee_id):"
            "\n  CSO-2024-001, NSSO-2022-015, DES-2025-003, MOSPI-2018-042, MOSPI-ADMIN-001"
        )
