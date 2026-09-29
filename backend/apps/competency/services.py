"""
ORBIS Competency — Services
===========================
Services for generating Official Competency Cards and Skill Passports.
"""

import hashlib
from typing import Dict, Any
from apps.accounts.models import OfficialProfile
from apps.competency.models import RoleRequirement
from apps.evidence.models import OfficialCompetencyScore, EvidenceRecord


def generate_competency_card(official: OfficialProfile) -> Dict[str, Any]:
    """
    Constructs the Official Competency Card & Digital Skill Passport
    for an official in India's Official Statistical System.
    """
    user = official.user
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    dept_code = official.department.code if official.department else "MOSPI"
    dept_name = official.department.name if official.department else "Ministry of Statistics and Programme Implementation"
    job_title = official.job_role.title if official.job_role else (official.designation or "Statistical Officer")
    
    # Cryptographic verification seal
    raw_hash_seed = f"{official.id}:{official.employee_id}:{dept_code}:{official.job_role_id or ''}"
    verification_hash = hashlib.sha256(raw_hash_seed.encode()).hexdigest()[:24].upper()
    verification_seal = f"IN-MOSPI-ORBIS-{verification_hash}"

    # Fetch role requirements
    requirements = []
    if official.job_role:
        requirements = list(
            RoleRequirement.objects.filter(job_role=official.job_role)
            .select_related('competency', 'competency__category')
        )
        
    # Fetch existing competency scores
    scores = list(OfficialCompetencyScore.objects.filter(official=official).select_related('competency'))
    score_map = {s.competency_id: s.current_proficiency for s in scores}

    # Fetch all evidence records for the ledger
    evidence_records = list(
        EvidenceRecord.objects.filter(official=official)
        .select_related('competency')
        .order_by('-timestamp')
    )
    evidence_by_comp = {}
    for ev in evidence_records:
        evidence_by_comp.setdefault(ev.competency_id, []).append(ev)

    competency_items = []
    total_target_weighted = 0.0
    total_current_weighted = 0.0
    demonstrated_count = 0
    critical_gaps_count = 0

    for req in requirements:
        comp = req.competency
        current_prof = score_map.get(comp.id, 0)
        target_prof = req.target_proficiency
        weight = float(req.weight or 1.0)
        gap = max(0, target_prof - current_prof)
        is_critical = gap > 2

        if current_prof >= target_prof:
            status_label = "met"
            demonstrated_count += 1
        elif is_critical:
            status_label = "critical_gap"
            critical_gaps_count += 1
        else:
            status_label = "gap"

        total_target_weighted += (target_prof * weight)
        total_current_weighted += (min(current_prof, target_prof) * weight)

        comp_evidences = evidence_by_comp.get(comp.id, [])
        latest_ev = comp_evidences[0] if comp_evidences else None

        competency_items.append({
            "id": str(comp.id),
            "code": comp.code,
            "name": comp.name,
            "category": comp.category.name if comp.category else "General",
            "target_proficiency": target_prof,
            "current_proficiency": current_prof,
            "weight": weight,
            "gap": gap,
            "status": status_label,
            "evidence_count": len(comp_evidences),
            "latest_evidence": {
                "source_type": latest_ev.source_type,
                "source_type_display": latest_ev.get_source_type_display(),
                "score_raw": latest_ev.score_raw,
                "score_proficiency": latest_ev.score_proficiency,
                "timestamp": latest_ev.timestamp.isoformat(),
            } if latest_ev else None
        })

    # Overall readiness score (0-100%)
    if total_target_weighted > 0:
        readiness_index = round((total_current_weighted / total_target_weighted) * 100, 1)
    else:
        readiness_index = 0.0

    # Build evidence ledger
    ledger = []
    for ev in evidence_records:
        ledger.append({
            "id": str(ev.id),
            "competency_id": str(ev.competency.id),
            "competency_code": ev.competency.code,
            "competency_name": ev.competency.name,
            "source_type": ev.source_type,
            "source_type_display": ev.get_source_type_display(),
            "source_reference": ev.source_reference,
            "score_raw": ev.score_raw,
            "score_proficiency": ev.score_proficiency,
            "explanation": ev.explanation,
            "timestamp": ev.timestamp.isoformat(),
            "verification_seal": f"SEAL-{hashlib.sha256(f'{ev.id}:{ev.score_raw}'.encode()).hexdigest()[:12].upper()}"
        })

    return {
        "official": {
            "id": str(official.id),
            "user_id": official.user.id,
            "username": user.username,
            "full_name": full_name,
            "email": user.email,
            "employee_id": official.employee_id or "N/A",
            "designation": official.designation or job_title,
            "role": official.role,
            "role_title": job_title,
            "department_code": dept_code,
            "department_name": dept_name,
            "verification_seal": verification_seal,
            "cadre": "Indian Statistical Service / SSS",
        },
        "summary": {
            "readiness_index": readiness_index,
            "demonstrated_competencies_count": demonstrated_count,
            "required_competencies_count": len(requirements),
            "critical_gaps_count": critical_gaps_count,
            "total_evidence_records": len(evidence_records),
            "last_evaluated": evidence_records[0].timestamp.isoformat() if evidence_records else None,
        },
        "competencies": competency_items,
        "evidence_ledger": ledger,
    }
