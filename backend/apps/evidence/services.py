from .models import EvidenceRecord, OfficialCompetencyScore
from apps.accounts.models import OfficialProfile
from apps.competency.models import Competency

def map_raw_score_to_proficiency(raw_score: float) -> int:
    """
    Deterministic rubric to map a 0-100 score to the 1-5 ORBIS proficiency scale.
    """
    if raw_score >= 90:
        return 5 # Master
    elif raw_score >= 75:
        return 4 # Expert
    elif raw_score >= 60:
        return 3 # Advanced
    elif raw_score >= 40:
        return 2 # Intermediate
    return 1 # Basic

def record_evidence(
    official: OfficialProfile, 
    competency: Competency, 
    source_type: str, 
    raw_score: float, 
    explanation: str, 
    source_reference: str = ""
) -> EvidenceRecord:
    """
    Records a new piece of evidence and updates the user's aggregated OfficialCompetencyScore.
    """
    proficiency = map_raw_score_to_proficiency(raw_score)
    
    # 1. Create the Evidence Record
    evidence = EvidenceRecord.objects.create(
        official=official,
        competency=competency,
        source_type=source_type,
        source_reference=source_reference,
        score_raw=raw_score,
        score_proficiency=proficiency,
        explanation=explanation
    )
    
    # 2. Recalculate the overall competency score.
    # For now, a simple rolling average of the last 3 evidence scores (giving more weight to recent).
    recent_evidence = EvidenceRecord.objects.filter(
        official=official, 
        competency=competency
    ).order_by('-timestamp')[:3]
    
    avg_proficiency = sum([e.score_proficiency for e in recent_evidence]) / len(recent_evidence)
    new_overall_proficiency = round(avg_proficiency)
    
    # 3. Save aggregated score
    score_obj, created = OfficialCompetencyScore.objects.get_or_create(
        official=official,
        competency=competency,
        defaults={'current_proficiency': new_overall_proficiency}
    )
    
    if not created and score_obj.current_proficiency != new_overall_proficiency:
        score_obj.current_proficiency = new_overall_proficiency
        score_obj.save()
        
    return evidence
