from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.accounts.models import OfficialProfile, Department, JobRole
from apps.competency.models import CompetencyCategory, Competency, RoleRequirement
from apps.evidence.models import EvidenceRecord, OfficialCompetencyScore
from apps.competency.services import generate_competency_card


class CompetencyCardTests(TestCase):
    def setUp(self):
        self.dept = Department.objects.create(name="Central Statistics Office", code="CSO")
        self.job_role = JobRole.objects.create(title="Statistical Officer", code="SO", department=self.dept)
        self.user = User.objects.create_user(username="test.official", password="password123", first_name="Test", last_name="Officer")
        self.profile = OfficialProfile.objects.create(
            user=self.user,
            role="official",
            department=self.dept,
            job_role=self.job_role,
            employee_id="CSO-TEST-001"
        )
        self.category = CompetencyCategory.objects.create(name="Technical")
        self.comp1 = Competency.objects.create(name="Python", code="TECH-PY", category=self.category)
        self.comp2 = Competency.objects.create(name="SQL", code="TECH-SQL", category=self.category)

        self.req1 = RoleRequirement.objects.create(job_role=self.job_role, competency=self.comp1, target_proficiency=3, weight=1.0)
        self.req2 = RoleRequirement.objects.create(job_role=self.job_role, competency=self.comp2, target_proficiency=4, weight=1.5)

        self.client = APIClient()

    def test_generate_competency_card_service_empty(self):
        card = generate_competency_card(self.profile)
        self.assertEqual(card['official']['full_name'], "Test Officer")
        self.assertEqual(card['summary']['readiness_index'], 0.0)
        self.assertEqual(card['summary']['required_competencies_count'], 2)
        self.assertEqual(card['summary']['demonstrated_competencies_count'], 0)
        self.assertTrue(card['official']['verification_seal'].startswith("IN-MOSPI-ORBIS-"))

    def test_generate_competency_card_service_with_evidence(self):
        OfficialCompetencyScore.objects.create(official=self.profile, competency=self.comp1, current_proficiency=3)
        EvidenceRecord.objects.create(
            official=self.profile,
            competency=self.comp1,
            source_type="competency_lab",
            source_reference="lab-1",
            score_raw=85.0,
            score_proficiency=3,
            explanation="Good script"
        )

        card = generate_competency_card(self.profile)
        self.assertEqual(card['summary']['demonstrated_competencies_count'], 1)
        self.assertEqual(card['summary']['total_evidence_records'], 1)
        self.assertGreater(card['summary']['readiness_index'], 0.0)
        self.assertEqual(len(card['evidence_ledger']), 1)
        self.assertTrue(card['evidence_ledger'][0]['verification_seal'].startswith("SEAL-"))

    def test_competency_card_me_endpoint(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/competency/card/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['official']['username'], "test.official")
        self.assertEqual(len(resp.data['competencies']), 2)

    def test_user_competency_card_endpoint(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(f'/api/users/{self.user.id}/competency-card/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['official']['employee_id'], "CSO-TEST-001")
