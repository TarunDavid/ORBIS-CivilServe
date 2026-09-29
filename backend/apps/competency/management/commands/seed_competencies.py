from django.core.management.base import BaseCommand
from apps.competency.models import CompetencyCategory, Competency, RoleRequirement
from apps.accounts.models import JobRole

class Command(BaseCommand):
    help = 'Seed initial SIH 26101 competency categories, competencies, and role requirements'

    def handle(self, *args, **kwargs):
        # 1. Create Competency Categories
        self.stdout.write("Creating Competency Categories...")
        categories_data = [
            {"name": "Statistical", "description": "Core statistical methods and processes"},
            {"name": "Technical", "description": "Tools, programming, and IT skills"},
            {"name": "Digital Governance", "description": "Data privacy, security, and digital infrastructure"},
            {"name": "Behavioral / Managerial", "description": "Leadership, communication, and management"}
        ]
        categories = {}
        for cat_data in categories_data:
            cat, created = CompetencyCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]}
            )
            categories[cat.name] = cat
        
        # 2. Create Competencies
        self.stdout.write("Creating Competencies...")
        competencies_data = [
            # Statistical
            ("Survey Design", "STAT-SD", categories["Statistical"]),
            ("Sampling", "STAT-SAMP", categories["Statistical"]),
            ("National Accounts", "STAT-NA", categories["Statistical"]),
            ("Data Quality Frameworks", "STAT-DQ", categories["Statistical"]),
            # Technical
            ("Python", "TECH-PY", categories["Technical"]),
            ("SQL", "TECH-SQL", categories["Technical"]),
            ("Data Visualization", "TECH-DATAVIZ", categories["Technical"]),
            # Digital Governance
            ("Cybersecurity", "DIGI-CYBER", categories["Digital Governance"]),
            ("Data Privacy", "DIGI-PRIV", categories["Digital Governance"]),
            # Behavioral
            ("Leadership", "BEHAV-LEAD", categories["Behavioral / Managerial"]),
            ("Decision Making", "BEHAV-DEC", categories["Behavioral / Managerial"]),
        ]
        
        comps = {}
        for name, code, category in competencies_data:
            comp, created = Competency.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "category": category,
                    "description": f"Standard {name} competency"
                }
            )
            comps[code] = comp

        # 3. Map Role Requirements across Job Roles
        self.stdout.write("Mapping Role Requirements...")
        requirements_map = {
            "SO": [
                (comps["TECH-PY"], 3, 1.0),
                (comps["TECH-SQL"], 3, 1.0),
                (comps["STAT-SD"], 4, 1.5),
                (comps["STAT-DQ"], 3, 1.2),
                (comps["BEHAV-DEC"], 3, 1.0),
            ],
            "SSO": [
                (comps["STAT-SD"], 4, 1.5),
                (comps["STAT-DQ"], 4, 1.5),
                (comps["TECH-PY"], 4, 1.2),
                (comps["TECH-SQL"], 4, 1.2),
                (comps["BEHAV-LEAD"], 3, 1.2),
                (comps["BEHAV-DEC"], 4, 1.2),
            ],
            "DSO": [
                (comps["STAT-SD"], 4, 1.5),
                (comps["STAT-SAMP"], 4, 1.5),
                (comps["TECH-SQL"], 3, 1.0),
                (comps["BEHAV-DEC"], 3, 1.0),
            ],
            "JSA": [
                (comps["TECH-PY"], 2, 1.0),
                (comps["TECH-SQL"], 2, 1.0),
                (comps["STAT-DQ"], 2, 1.0),
            ]
        }

        for role_code, reqs in requirements_map.items():
            job_role = JobRole.objects.filter(code=role_code).first()
            if not job_role:
                job_role = JobRole.objects.create(code=role_code, title=f"Job Role {role_code}", level="mid")
            for comp, target, weight in reqs:
                RoleRequirement.objects.get_or_create(
                    job_role=job_role,
                    competency=comp,
                    defaults={
                        "target_proficiency": target,
                        "weight": weight
                    }
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded competency data.'))
