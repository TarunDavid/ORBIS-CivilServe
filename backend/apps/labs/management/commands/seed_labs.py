from django.core.management.base import BaseCommand
from apps.competency.models import Competency
from apps.labs.models import CompetencyLab

class Command(BaseCommand):
    help = 'Seed Flagship Experiential Competency Labs for the demo'

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

        # 1. FLAGSHIP CRISIS LAB: Statistical Decision-Making & Conflict Resolution (BEHAV-DEC)
        if dec_comp:
            crisis_scenario_data = {
                "simulation_title": "Operation Embargo: The CPI Price Index Anomaly",
                "time_remaining_seconds": 3600,
                "urgency_level": "CRITICAL",
                "initial_metrics": {
                    "integrity": 80,
                    "trust": 75,
                    "timeliness": 90,
                    "coordination": 70
                },
                "stages": [
                    {
                        "stage_id": 1,
                        "title": "Stage 1: Breaking Anomaly Alert (T-minus 2 Hours to Embargo Lift)",
                        "briefing": "At 15:00 hrs, two hours before the national Consumer Price Index (CPI) release, the automated validation pipeline flags a +42.8% surge in the urban fuel & transportation sub-index. The Press Information Bureau (PIB) has already scheduled the live media telecast for 17:00 hrs. A senior official in the Ministry of Finance requests the immediate advance draft.",
                        "memos": [
                            {
                                "from": "Dr. V. Sharma (Lead Data Validation Engineer)",
                                "urgency": "High",
                                "message": "The +42.8% spike in Region 4 fuel indices contradicts market price trends. We suspect an unverified unit-conversion error by two newly trained district price collectors in Sector 9."
                            },
                            {
                                "from": "R. Menon (Joint Secretary, Media & Press Liaison)",
                                "urgency": "Urgent",
                                "message": "National TV networks are lined up for the 17:00 release. Cancelling or deferring without explanation will cause speculative panic in financial markets."
                            }
                        ],
                        "options": [
                            {
                                "id": "A",
                                "label": "Option A: Immediate Embargo Freeze & Targeted Field Audit",
                                "description": "Issue an immediate 24-hour embargo freeze. Dispatch senior field supervisors to re-survey the Sector 9 fuel depots before publication.",
                                "impact": {"integrity": 20, "trust": -10, "timeliness": -25, "coordination": 10},
                                "consequence": "Markets experience minor speculation over the deferral, but statistical integrity is preserved. Supervisors discover the price collectors recorded LPG cylinders per-quintal instead of per-unit."
                            },
                            {
                                "id": "B",
                                "label": "Option B: Release on Schedule with Conditional Explanatory Footnote",
                                "description": "Publish the CPI at 17:00 as planned, but attach a prominent provisional caveat noting that Region 4 fuel indices are subject to ex-post revision.",
                                "impact": {"integrity": -15, "trust": -20, "timeliness": 10, "coordination": -5},
                                "consequence": "Media outlets seize upon the anomaly and accuse the department of publishing unverified figures. Bond yields swing erratically on faulty fuel inflation expectations."
                            },
                            {
                                "id": "C",
                                "label": "Option C: Issue Partial Flash Release Excluding Region 4",
                                "description": "Release the national aggregate CPI without Region 4 sub-indices, stating that supplementary tables will follow within 48 hours.",
                                "impact": {"integrity": 10, "trust": 5, "timeliness": 0, "coordination": 15},
                                "consequence": "Financial institutions commend the transparency. Regional stakeholders question the exclusion, but overall credibility remains intact."
                            }
                        ]
                    },
                    {
                        "stage_id": 2,
                        "title": "Stage 2: Verification Findings & Whistleblower Inquiry (T-minus 45 Mins)",
                        "briefing": "Field supervisors verify that two price collection tablets in Sector 9 malfunctioned, transposing retail diesel prices with wholesale aviation turbine fuel. Simultaneously, an anonymous blog post claims the department is suppressing inflation numbers under political pressure.",
                        "memos": [
                            {
                                "from": "Chief Field Inspector (Zone North)",
                                "urgency": "Immediate",
                                "message": "Corrected diesel price confirmed: Rs 92.40/L (was entered as Rs 154.20/L). True regional sub-index change is +3.1%, not +42.8%."
                            },
                            {
                                "from": "Office of the Chief Statistician of India",
                                "urgency": "Critical",
                                "message": "The Cabinet Secretary has requested an urgent situation memo explaining our remediation protocol and public communication strategy."
                            }
                        ],
                        "options": [
                            {
                                "id": "A",
                                "label": "Option A: Publish Corrected Flash Bulletin with Full Audit Disclosure",
                                "description": "Update the figures with verified ground data, publish an transparent technical errata memo disclosing the tablet data-entry error, and brief the press openly.",
                                "impact": {"integrity": 15, "trust": 15, "timeliness": -5, "coordination": 10},
                                "consequence": "Transparent disclosure defuses the whistleblower allegations. Independent economists praise the statistical audit rigour."
                            },
                            {
                                "id": "B",
                                "label": "Option B: Quietly Overwrite Data Without Detailed Technical Errata",
                                "description": "Replace the faulty numbers with corrected ones in the release bundle without public explanation to minimize sensational headlines.",
                                "impact": {"integrity": -20, "trust": -30, "timeliness": 5, "coordination": -15},
                                "consequence": "Journalists comparing cached preview drafts identify the silent change. Accusations of cover-up lead to a parliamentary inquiry."
                            }
                        ]
                    },
                    {
                        "stage_id": 3,
                        "title": "Stage 3: Institutional Governance & Long-Term Safeguards",
                        "briefing": "The crisis has subsided, but the National Statistical Commission requires a formal Institutional Safeguard Protocol to prevent future release-hour discrepancies.",
                        "memos": [
                            {
                                "from": "Audit & Standards Committee",
                                "urgency": "Medium",
                                "message": "Recommend formal rules for pre-release validation thresholds, dual-signoff keys, and whistleblower escalation."
                            }
                        ],
                        "options": [
                            {
                                "id": "A",
                                "label": "Option A: Implement Automated Statistical Sanity Bounds & Dual Cryptographic Sign-Off",
                                "description": "Mandate automated range checks (rejecting >3 sigma jumps) on all tablet uploads, plus dual cryptographic sign-off between District Collector and Chief Methodologist.",
                                "impact": {"integrity": 25, "trust": 20, "timeliness": 5, "coordination": 20},
                                "consequence": "State-of-the-art data governance established. The protocol is adopted as the national benchmark across all statistical surveys."
                            },
                            {
                                "id": "B",
                                "label": "Option B: Rely on Manual Peer Review Checklists Prior to Release",
                                "description": "Introduce an additional 4-hour manual checklist review by regional directors without changing the software validation pipeline.",
                                "impact": {"integrity": 5, "trust": 5, "timeliness": -20, "coordination": -10},
                                "consequence": "Creates significant administrative bottlenecks and human fatigue without eliminating localized data-entry transposition errors."
                            }
                        ]
                    }
                ]
            }

            CompetencyLab.objects.create(
                competency=dec_comp,
                title="Statistical Release Embargo Crisis Simulation",
                description="High-stakes crisis war room scenario: Two hours prior to the national CPI release, a major sub-index anomaly is flagged while the press and markets await publication. Navigate multi-stage dilemmas balancing Statistical Integrity, Public Trust, and Inter-Agency Protocol.",
                environment_type='crisis_simulation',
                scenario_data=crisis_scenario_data,
                evaluation_rubric="Award 90-100 if candidate consistently prioritizes statistical integrity and transparent accountability (e.g. Stage 1 Option A/C, Stage 2 Option A, Stage 3 Option A) and provides a rigorous executive rationale. Deduct points for silent data tampering, reckless early release of corrupt data, or lack of institutional safeguards."
            )
            created_count += 1

        # 2. FLAGSHIP DATA DETECTIVE LAB: Microdata Quality Audit (STAT-DQ)
        if dq_comp:
            detective_scenario_data = {
                "dataset_name": "National Rural Health & Demographics Survey (Microdata Audit Sample)",
                "audit_objective": "Audit the 25 sample household records below. Detect physiological impossibilities, duplicate records, jurisdiction mismatches, and domain outliers. Flag each defective record, identify the anomaly category, and recommend remediation.",
                "target_anomaly_count": 5,
                "columns": ["record_id", "state_code", "district_id", "respondent_age", "monthly_income_inr", "dependents_count", "systolic_bp", "diastolic_bp", "survey_status"],
                "records": [
                    {"record_id": "REC-101", "state_code": "KA", "district_id": "KA-04", "respondent_age": 34, "monthly_income_inr": 28500, "dependents_count": 3, "systolic_bp": 120, "diastolic_bp": 80, "survey_status": "Verified"},
                    {"record_id": "REC-102", "state_code": "KA", "district_id": "KA-04", "respondent_age": 42, "monthly_income_inr": 31000, "dependents_count": 2, "systolic_bp": 125, "diastolic_bp": 82, "survey_status": "Verified"},
                    {"record_id": "REC-103", "state_code": "MH", "district_id": "MH-12", "respondent_age": 29, "monthly_income_inr": 45000, "dependents_count": 1, "systolic_bp": 118, "diastolic_bp": 78, "survey_status": "Verified"},
                    {"record_id": "REC-104", "state_code": "MH", "district_id": "MH-12", "respondent_age": 240, "monthly_income_inr": 22000, "dependents_count": 2, "systolic_bp": 130, "diastolic_bp": 85, "survey_status": "Verified"},
                    {"record_id": "REC-105", "state_code": "TN", "district_id": "TN-01", "respondent_age": 55, "monthly_income_inr": 18000, "dependents_count": 4, "systolic_bp": 138, "diastolic_bp": 88, "survey_status": "Verified"},
                    {"record_id": "REC-106", "state_code": "TN", "district_id": "TN-01", "respondent_age": 38, "monthly_income_inr": 52000, "dependents_count": 3, "systolic_bp": 122, "diastolic_bp": 80, "survey_status": "Verified"},
                    {"record_id": "REC-107", "state_code": "UP", "district_id": "UP-15", "respondent_age": 47, "monthly_income_inr": 26000, "dependents_count": 5, "systolic_bp": 128, "diastolic_bp": 84, "survey_status": "Verified"},
                    {"record_id": "REC-108", "state_code": "UP", "district_id": "UP-15", "respondent_age": 31, "monthly_income_inr": 34000, "dependents_count": 2, "systolic_bp": 119, "diastolic_bp": 79, "survey_status": "Verified"},
                    {"record_id": "REC-109", "state_code": "GJ", "district_id": "GJ-08", "respondent_age": 50, "monthly_income_inr": 60000, "dependents_count": 3, "systolic_bp": 132, "diastolic_bp": 86, "survey_status": "Verified"},
                    {"record_id": "REC-110", "state_code": "GJ", "district_id": "GJ-08", "respondent_age": 28, "monthly_income_inr": 29000, "dependents_count": 1, "systolic_bp": 115, "diastolic_bp": 75, "survey_status": "Verified"},
                    {"record_id": "REC-111", "state_code": "KA", "district_id": "KA-04", "respondent_age": 45, "monthly_income_inr": 38000, "dependents_count": 4, "systolic_bp": 126, "diastolic_bp": 82, "survey_status": "Verified"},
                    {"record_id": "REC-112", "state_code": "WB", "district_id": "WB-02", "respondent_age": 39, "monthly_income_inr": 27000, "dependents_count": 3, "systolic_bp": 124, "diastolic_bp": 81, "survey_status": "Verified"},
                    {"record_id": "REC-113", "state_code": "WB", "district_id": "WB-02", "respondent_age": 52, "monthly_income_inr": 33000, "dependents_count": 2, "systolic_bp": 135, "diastolic_bp": 89, "survey_status": "Verified"},
                    {"record_id": "REC-114", "state_code": "DL", "district_id": "DL-01", "respondent_age": 33, "monthly_income_inr": 75000, "dependents_count": 1, "systolic_bp": 120, "diastolic_bp": 78, "survey_status": "Verified"},
                    {"record_id": "REC-115", "state_code": "DL", "district_id": "DL-01", "respondent_age": 61, "monthly_income_inr": 42000, "dependents_count": 2, "systolic_bp": 142, "diastolic_bp": 92, "survey_status": "Verified"},
                    {"record_id": "REC-116", "state_code": "KL", "district_id": "KL-07", "respondent_age": 36, "monthly_income_inr": 48000, "dependents_count": 2, "systolic_bp": 118, "diastolic_bp": 76, "survey_status": "Verified"},
                    {"record_id": "REC-117", "state_code": "KL", "district_id": "KL-07", "respondent_age": 44, "monthly_income_inr": 51000, "dependents_count": 3, "systolic_bp": 122, "diastolic_bp": 80, "survey_status": "Verified"},
                    {"record_id": "REC-118", "state_code": "RJ", "district_id": "TN-99", "respondent_age": 48, "monthly_income_inr": 23000, "dependents_count": 4, "systolic_bp": 130, "diastolic_bp": 84, "survey_status": "Verified"},
                    {"record_id": "REC-119", "state_code": "WB", "district_id": "WB-02", "respondent_age": 39, "monthly_income_inr": 27000, "dependents_count": 3, "systolic_bp": 124, "diastolic_bp": 81, "survey_status": "Verified"},
                    {"record_id": "REC-120", "state_code": "MP", "district_id": "MP-03", "respondent_age": 30, "monthly_income_inr": 21000, "dependents_count": 2, "systolic_bp": 116, "diastolic_bp": 76, "survey_status": "Verified"},
                    {"record_id": "REC-121", "state_code": "MP", "district_id": "MP-03", "respondent_age": 58, "monthly_income_inr": 35000, "dependents_count": 3, "systolic_bp": 140, "diastolic_bp": 90, "survey_status": "Verified"},
                    {"record_id": "REC-122", "state_code": "BR", "district_id": "BR-05", "respondent_age": 41, "monthly_income_inr": 19000, "dependents_count": 6, "systolic_bp": 125, "diastolic_bp": 82, "survey_status": "Verified"},
                    {"record_id": "REC-123", "state_code": "BR", "district_id": "BR-05", "respondent_age": 35, "monthly_income_inr": 24000, "dependents_count": 52, "systolic_bp": 121, "diastolic_bp": 79, "survey_status": "Verified"},
                    {"record_id": "REC-124", "state_code": "TS", "district_id": "TS-09", "respondent_age": 49, "monthly_income_inr": 65000, "dependents_count": 2, "systolic_bp": 128, "diastolic_bp": 84, "survey_status": "Verified"},
                    {"record_id": "REC-125", "state_code": "TS", "district_id": "TS-09", "respondent_age": 37, "monthly_income_inr": 41000, "dependents_count": 1, "systolic_bp": 45, "diastolic_bp": 185, "survey_status": "Verified"},
                ],
                "ground_truth_anomalies": [
                    {
                        "record_id": "REC-104",
                        "field": "respondent_age",
                        "anomaly_type": "Physiological Impossibility",
                        "explanation": "Respondent age recorded as 240, which exceeds biological human lifespan limits (data-entry transposition error)."
                    },
                    {
                        "record_id": "REC-118",
                        "field": "district_id",
                        "anomaly_type": "Jurisdiction Mismatch",
                        "explanation": "State code 'RJ' (Rajasthan) does not match district ID prefix 'TN-99' (Tamil Nadu), indicating a spatial indexing defect."
                    },
                    {
                        "record_id": "REC-119",
                        "field": "record_id",
                        "anomaly_type": "Duplicate Entry",
                        "explanation": "REC-119 is an exact identical duplicate clone of REC-112 across all demographic and clinical metrics."
                    },
                    {
                        "record_id": "REC-123",
                        "field": "dependents_count",
                        "anomaly_type": "Domain Outlier",
                        "explanation": "Recorded 52 dependents for a single rural household, exceeding statistical plausibility (>6 sigma above survey mean)."
                    },
                    {
                        "record_id": "REC-125",
                        "field": "systolic_bp",
                        "anomaly_type": "Physiological Inversion",
                        "explanation": "Systolic blood pressure (45) is lower than diastolic pressure (185), representing an impossible physiological measurement inversion."
                    }
                ]
            }

            CompetencyLab.objects.create(
                competency=dq_comp,
                title="Microdata Quality Detective: Rural Health Audit",
                description="Interactive Microdata Quality Workbench: Perform an audit on 25 primary survey records from the National Rural Health & Demographics Survey. Spot subtle data flaws, physiological impossibilities, duplicate records, and spatial index errors before national aggregation.",
                environment_type='data_detective',
                scenario_data=detective_scenario_data,
                evaluation_rubric="Award scores based on Precision, Recall, and F1 score against the 5 embedded ground-truth anomalies. Award 90-100 for identifying all 5 anomalies with accurate categorizations. Deduct points for false alarms on valid records."
            )
            created_count += 1

        # 3. PYTHON DATA LAB: Cleaning Rural Health Survey Data with Pandas (TECH-PY)
        if python_comp:
            python_scenario_data = {
                "starter_code": "import pandas as pd\nimport numpy as np\n\n# 1. Load the raw survey CSV\ndf = pd.read_csv('survey_raw.csv')\n\n# 2. Impute missing values in 'age' with median\n# Write your code here...\n\n# 3. Standardize 'village' names to uppercase\n# Write your code here...\n\n# 4. Group by village and calculate respondent count & average age\n# summary = ...\n# print(summary)\n",
                "sample_dataset": [
                    {"id": 1, "village": "rampur", "age": 34, "health_score": 78},
                    {"id": 2, "village": "Rampur", "age": None, "health_score": 82},
                    {"id": 3, "village": "shivpur", "age": 45, "health_score": 65},
                    {"id": 4, "village": "SHIVPUR", "age": 29, "health_score": 90},
                    {"id": 5, "village": "kalyanpur", "age": None, "health_score": 71}
                ],
                "expected_output_hint": "Village 'RAMPUR' count: 2, 'SHIVPUR' count: 2, 'KALYANPUR' count: 1. Imputed age replaces NaNs with 34.0."
            }

            CompetencyLab.objects.create(
                competency=python_comp,
                title="Cleaning Rural Health Survey Data with Pandas",
                description="Scenario:\nYou have received a raw CSV file containing rural health survey responses across pilot districts.\nThe dataset contains missing values in the 'age' column and inconsistent casing in the 'village' column.\n\nTask:\nWrite a Python script using pandas to:\n1. Load the dataset (df = pd.read_csv('survey_raw.csv'))\n2. Impute missing values in 'age' with the median age\n3. Standardize 'village' column strings to uppercase\n4. Output summary counts of respondents grouped by village.",
                environment_type='python_notebook',
                scenario_data=python_scenario_data,
                evaluation_rubric="Award 90-100 if candidate utilizes pandas with read_csv, fillna() or median imputation, str.upper(), and groupby() count. Award 60-80 for partial implementation."
            )
            created_count += 1

        # 4. SQL LAB: Cross-Registry Demographic Discrepancy Query (TECH-SQL)
        if sql_comp:
            sql_scenario_data = {
                "starter_query": "-- Write an ANSI SQL query to reconcile district population figures\nSELECT \n    c.district_id,\n    c.district_name,\n    c.population AS census_pop,\n    h.population AS health_pop,\n    ABS(c.population - h.population) * 100.0 / c.population AS discrepancy_pct\nFROM census_district_data c\nJOIN national_health_registry h ON c.district_id = h.district_id\n-- Add discrepancy filter and sorting below:\n",
                "tables_schema": {
                    "census_district_data": ["district_id (VARCHAR)", "district_name (VARCHAR)", "population (INT)", "last_updated (DATE)"],
                    "national_health_registry": ["district_id (VARCHAR)", "registered_citizens (INT)", "population (INT)", "sync_date (DATE)"]
                },
                "expected_conditions": ["INNER JOIN or JOIN", "ABS()", "discrepancy > 5", "ORDER BY DESC"]
            }

            CompetencyLab.objects.create(
                competency=sql_comp,
                title="Cross-Registry Demographic Discrepancy Query",
                description="Scenario:\nThe Ministry needs to reconcile the 'census_district_data' table and the 'national_health_registry' table to detect population count reporting discrepancies.\n\nTask:\nWrite an ANSI SQL query to:\n1. INNER JOIN census_district_data c with national_health_registry h ON c.district_id = h.district_id\n2. Calculate the absolute percentage variance in recorded population: ABS(c.population - h.population) * 100.0 / c.population\n3. Filter for districts where the discrepancy exceeds 5%\n4. Order by discrepancy descending.",
                environment_type='sql_terminal',
                scenario_data=sql_scenario_data,
                evaluation_rubric="Award 90-100 if candidate writes a clean SELECT query with JOIN, percentage delta calculation, WHERE filter > 5%, and ORDER BY discrepancy DESC."
            )
            created_count += 1

        # 5. SURVEY DESIGN: Designing the Gig-Economy Labour Survey Module (STAT-SD)
        if survey_comp:
            CompetencyLab.objects.create(
                competency=survey_comp,
                title="Designing the Gig-Economy Labour Survey Module",
                description="Scenario:\nThe National Statistical Commission has commissioned a new inquiry module to capture informal and platform gig-workers (delivery, cab aggregates, freelance gigs) in the Periodic Labour Force Survey (PLFS).\n\nTask:\n1. Draft 3 standardized screening questions that differentiate primary platform workers from casual secondary earners.\n2. Specify the recall period (7-day vs 30-day) with statistical justification.\n3. Outline the sampling stratifier to prevent urban cluster bias.",
                environment_type='policy_canvas',
                scenario_data={
                    "sections": ["1. Screening Questions & Operational Criteria", "2. Recall Window Justification", "3. Sampling Stratification & Non-Response Adjustments"],
                    "keywords": ["platform", "recall", "primary vs secondary", "cluster sampling", "strata"]
                },
                evaluation_rubric="Award 85-100 if draft includes unambiguous non-leading questions, operational definitions of platform work, appropriate recall justification, and stratified multi-stage cluster sampling design."
            )
            created_count += 1

        # 6. SAMPLING LAB: Multistage Cluster Sampling Weight Allocation (STAT-SAMP)
        if samp_comp:
            CompetencyLab.objects.create(
                competency=samp_comp,
                title="Multistage Cluster Sampling Weight Allocation",
                description="Scenario:\nYou are designing the sample allocation for a socio-economic survey covering 28 states with high intra-state variance.\n\nTask:\nDraft the sample allocation strategy:\n1. Define First Stage Units (FSUs) and Ultimate Stage Units (USUs).\n2. Explain proportional vs optimum (Neyman) allocation based on stratum variances.\n3. Detail the multiplier/weight adjustment procedure for non-response.",
                environment_type='policy_canvas',
                scenario_data={
                    "sections": ["1. Stage Unit Hierarchies (FSU & USU)", "2. Neyman Optimum Allocation Formula & Variance Trade-offs", "3. Non-Response Weighting Adjustments"],
                    "keywords": ["FSU", "USU", "Neyman", "variance", "stratum", "multiplier"]
                },
                evaluation_rubric="Award 90-100 if candidate correctly defines FSUs, demonstrates Neyman allocation formula, and specifies non-response weight adjustment factors."
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} Flagship Competency Labs!'))
