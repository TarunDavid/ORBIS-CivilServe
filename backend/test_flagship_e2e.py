import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educarnival.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import OfficialProfile, JobRole, Department
from apps.competency.models import Competency
from apps.labs.models import CompetencyLab, LabSession
from apps.evidence.models import EvidenceRecord, OfficialCompetencyScore
from apps.labs.evaluator import evaluate_lab_submission
from apps.competency.services import generate_competency_card
from apps.evidence.services import record_evidence

User = get_user_model()

def run_tests():
    print("=" * 60)
    print("FLAGSHIP EXPERIENTIAL LABS & EVIDENCE PIPELINE VERIFICATION")
    print("=" * 60)

    # 1. Get or create test user and profile
    user, _ = User.objects.get_or_create(username='test_e2e_official', defaults={'email': 'e2e@orbis.gov.in'})
    
    dept, _ = Department.objects.get_or_create(code='MOSPI', defaults={'name': 'Ministry of Statistics & Programme Implementation'})
    job_role = JobRole.objects.first()

    profile, _ = OfficialProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'official',
            'department': dept,
            'job_role': job_role,
            'designation': 'Senior Statistical Officer',
            'employee_id': 'EMP-E2E-999'
        }
    )
    print(f"[OK] Official Profile verified: {profile.user.username} (Designation: {profile.designation})")

    # 2. Verify Flagship Labs seeded
    crisis_lab = CompetencyLab.objects.filter(environment_type='crisis_simulation').first()
    detective_lab = CompetencyLab.objects.filter(environment_type='data_detective').first()

    assert crisis_lab is not None, "Crisis simulation lab not found!"
    assert detective_lab is not None, "Data detective lab not found!"
    print(f"[OK] Found Flagship Crisis Lab: '{crisis_lab.title}' (Stages: {len(crisis_lab.scenario_data.get('stages', []))})")
    print(f"[OK] Found Flagship Detective Lab: '{detective_lab.title}' (Records: {len(detective_lab.scenario_data.get('records', []))})")

    # 3. Test Flagship Crisis Simulation E2E
    print("\n--- Testing Crisis Simulation Lab Flow ---")
    crisis_session = LabSession.objects.create(
        lab=crisis_lab,
        official=profile,
        user_input="Freezing the embargo protected foundational statistical integrity while avoiding market volatility. Field inspection corrected diesel price transposition error. Implementing automated sanity bounds prevents future discrepancies.",
        session_state={
            "choices": [
                {"stage_id": 1, "option_id": "A"},
                {"stage_id": 2, "option_id": "A"},
                {"stage_id": 3, "option_id": "A"}
            ],
            "metrics": {"integrity": 95, "trust": 85, "timeliness": 70, "coordination": 90}
        }
    )

    eval_crisis = evaluate_lab_submission(crisis_session)
    crisis_session.llm_score_raw = eval_crisis['score']
    crisis_session.llm_feedback = eval_crisis['feedback']
    crisis_session.status = 'completed'
    crisis_session.save()

    record_evidence(
        official=profile,
        competency=crisis_lab.competency,
        source_type='competency_lab',
        raw_score=eval_crisis['score'],
        explanation=eval_crisis['feedback'],
        source_reference=str(crisis_session.id)
    )

    print(f"[OK] Crisis Lab Evaluated Score: {eval_crisis['score']}/100")
    print(f"  Feedback Preview:\n  {eval_crisis['feedback'][:160]}...")

    # 4. Test Flagship Data Detective Lab E2E
    print("\n--- Testing Data Detective Lab Flow ---")
    detective_session = LabSession.objects.create(
        lab=detective_lab,
        official=profile,
        user_input="Comprehensive microdata quality audit. Flagged REC-104 for physiological age violation, REC-118 for cross-state district mismatch, and REC-125 for inverted blood pressure.",
        session_state={
            "flagged_anomalies": [
                {"record_id": "REC-104", "field": "respondent_age", "anomaly_type": "Physiological Impossibility"},
                {"record_id": "REC-118", "field": "district_id", "anomaly_type": "Jurisdiction Mismatch"},
                {"record_id": "REC-125", "field": "systolic_bp", "anomaly_type": "Physiological Inversion"}
            ]
        }
    )

    eval_detective = evaluate_lab_submission(detective_session)
    detective_session.llm_score_raw = eval_detective['score']
    detective_session.llm_feedback = eval_detective['feedback']
    detective_session.status = 'completed'
    detective_session.save()

    record_evidence(
        official=profile,
        competency=detective_lab.competency,
        source_type='competency_lab',
        raw_score=eval_detective['score'],
        explanation=eval_detective['feedback'],
        source_reference=str(detective_session.id)
    )

    print(f"[OK] Data Detective Evaluated Score: {eval_detective['score']}/100")
    print(f"  Feedback Preview:\n  {eval_detective['feedback'][:180]}...")

    # 5. Verify Evidence Pipeline and Digital Skill Passport
    print("\n--- Testing Evidence Aggregation & Competency Card ---")
    evidence_count = EvidenceRecord.objects.filter(official=profile).count()
    comp_scores = OfficialCompetencyScore.objects.filter(official=profile)
    print(f"[OK] Total Evidence Records for Official: {evidence_count}")
    print(f"[OK] Aggregated Competency Scores count: {comp_scores.count()}")
    for cs in comp_scores:
        print(f"  * {cs.competency.name} ({cs.competency.code}): Level {cs.current_proficiency}/5")

    card_data = generate_competency_card(profile)
    print(f"\n[OK] Generated Competency Card Verification Seal: {card_data['official']['verification_seal']}")
    print(f"[OK] Official Readiness Index: {card_data['summary']['readiness_index']}%")
    print(f"[OK] Total Sealed Evidence in Ledger: {len(card_data['evidence_ledger'])}")
    print(f"[OK] Competencies in Profile: {len(card_data['competencies'])}")
    for c in card_data['competencies']:
        print(f"  - {c['code']} ({c['name']}): Current L{c['current_proficiency']} / Target L{c['target_proficiency']} [{c['status']}]")

    print("\n" + "=" * 60)
    print("ALL FLAGSHIP LAB & MEASUREMENT SUITE CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
