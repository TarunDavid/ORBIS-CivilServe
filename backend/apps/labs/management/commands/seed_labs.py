from django.core.management.base import BaseCommand
from apps.competency.models import Competency
from apps.labs.models import CompetencyLab

class Command(BaseCommand):
    help = 'Seed Experiential Competency Labs for the demo'

    def handle(self, *args, **kwargs):
        CompetencyLab.objects.all().delete()

        # Get existing competencies by accurate code
        python_comp = Competency.objects.filter(code='TECH-PY').first()
        sql_comp = Competency.objects.filter(code='TECH-SQL').first()
        survey_comp = Competency.objects.filter(code='STAT-SD').first()
        dq_comp = Competency.objects.filter(code='STAT-DQ').first()
        samp_comp = Competency.objects.filter(code='STAT-SAMP').first()
        dec_comp = Competency.objects.filter(code='BEHAV-DEC').first()

        created_count = 0

        if python_comp:
            CompetencyLab.objects.create(
                competency=python_comp,
                title="Cleaning Rural Health Survey Data with Pandas",
                description="Scenario:\nYou have received a raw CSV file containing rural health survey responses across 5 pilot districts.\nThe dataset contains missing values in the 'age' column and inconsistent casing in the 'village' column.\n\nTask:\nWrite a Python script using pandas to:\n1. Load the dataset (data = pd.read_csv('survey_raw.csv'))\n2. Impute missing values in the 'age' column with the median age\n3. Standardize the 'village' column strings to uppercase\n4. Output summary counts of respondents grouped by village.",
                environment_type='python_notebook',
                evaluation_rubric="Award 90-100 if candidate utilizes pandas with read_csv, fillna() or median imputation, str.upper(), and groupby() count. Award 60-80 for partial implementation."
            )
            created_count += 1

        if sql_comp:
            CompetencyLab.objects.create(
                competency=sql_comp,
                title="Cross-Registry Demographic Discrepancy Query",
                description="Scenario:\nThe Ministry needs to reconcile the 'census_district_data' table and the 'national_health_registry' table to detect population count reporting discrepancies.\n\nTask:\nWrite an ANSI SQL query to:\n1. INNER JOIN census_district_data c with national_health_registry h ON c.district_id = h.district_id\n2. Calculate the absolute percentage variance in recorded population: ABS(c.population - h.population) * 100.0 / c.population\n3. Filter for districts where the discrepancy exceeds 5%\n4. Order by discrepancy descending.",
                environment_type='sql_terminal',
                evaluation_rubric="Award 90-100 if candidate writes a clean SELECT query with JOIN, percentage delta calculation, WHERE filter > 5%, and ORDER BY discrepancy DESC."
            )
            created_count += 1

        if survey_comp:
            CompetencyLab.objects.create(
                competency=survey_comp,
                title="Designing the Gig-Economy Labour Survey Module",
                description="Scenario:\nThe National Statistical Commission has commissioned a new inquiry module to capture informal and platform gig-workers (delivery, cab aggregates, freelance gigs) in the Periodic Labour Force Survey (PLFS).\n\nTask:\n1. Draft 3 standardized screening questions that differentiate primary platform workers from casual secondary earners.\n2. Specify the recall period (7-day vs 30-day) with statistical justification.\n3. Outline the sampling stratifier to prevent urban cluster bias.",
                environment_type='policy_canvas',
                evaluation_rubric="Award 85-100 if draft includes unambiguous non-leading questions, operational definitions of platform work, appropriate recall justification, and stratified multi-stage cluster sampling design."
            )
            created_count += 1

        if dq_comp:
            CompetencyLab.objects.create(
                competency=dq_comp,
                title="National Data Quality Framework Outlier Audit",
                description="Scenario:\nDuring quarterly data consolidation, preliminary reports show an anomalous 400% spike in agricultural yields reported in Sector 4.\n\nTask:\nFormulate an official Data Quality Audit Protocol:\n1. Define the statistical anomaly detection threshold (e.g. Z-score > 3 or IQR method).\n2. Specify secondary source cross-verification checks (satellite vegetation index, rainfall telemetry).\n3. Outline corrective escalation actions under the NDSAP protocol.",
                environment_type='policy_canvas',
                evaluation_rubric="Award 90-100 for statistically rigorous outlier identification criteria, telemetry reconciliation steps, and institutional governance compliance."
            )
            created_count += 1

        if samp_comp:
            CompetencyLab.objects.create(
                competency=samp_comp,
                title="Multistage Cluster Sampling Weight Allocation",
                description="Scenario:\nYou are designing the sample allocation for a socio-economic survey covering 28 states with high intra-state variance.\n\nTask:\nDraft the sample allocation strategy:\n1. Define First Stage Units (FSUs) and Ultimate Stage Units (USUs).\n2. Explain proportional vs optimum (Neyman) allocation based on stratum variances.\n3. Detail the multiplier/weight adjustment procedure for non-response.",
                environment_type='policy_canvas',
                evaluation_rubric="Award 90-100 if candidate correctly defines FSUs, demonstrates Neyman allocation formula, and specifies non-response weight adjustment factors."
            )
            created_count += 1

        if dec_comp:
            CompetencyLab.objects.create(
                competency=dec_comp,
                title="Statistical Release Embargo Conflict Resolution",
                description="Scenario:\nTwo hours prior to the scheduled press release of the Consumer Price Index (CPI), an unverified discrepancy in the fuel sub-index weighting is detected.\n\nTask:\nProvide an Executive Action Plan:\n1. Immediate protocol for press release deferral vs release with caveat note.\n2. Verification procedure with the price collection field officers.\n3. Stakeholder communication note for the Chief Statistician of India.",
                environment_type='policy_canvas',
                evaluation_rubric="Award 90-100 for prudent risk mitigation, integrity safeguards, clear timeline management, and institutional protocol adherence."
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} Competency Labs!'))
