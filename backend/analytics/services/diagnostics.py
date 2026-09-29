from django.contrib.auth.models import User
from core.models import UserProfile, RoleCompetency
from analytics.models import CompetencyScore

class DiagnosticService:
    @staticmethod
    def get_user_radar(user_id: int):
        """
        Calculates the gap between a user's target competencies (based on their role)
        and their current assessed score. Returns data formatted for a Radar chart.
        """
        user = User.objects.get(id=user_id)
        profile = getattr(user, 'profile', None)
        
        if not profile or not profile.assigned_role:
            return {"error": "User does not have an assigned role."}
            
        role = profile.assigned_role
        role_comps = RoleCompetency.objects.filter(role=role).select_related('competency')
        
        radar_data = []
        for rc in role_comps:
            comp = rc.competency
            # Get current score, default to 0 if not assessed
            score_obj = CompetencyScore.objects.filter(user=user, competency=comp).first()
            current_level = score_obj.current_level if score_obj else 0.0
            
            # Gap analysis
            gap = max(0.0, float(rc.required_level) - current_level)
            
            radar_data.append({
                "competency_id": comp.id,
                "competency_name": comp.name,
                "domain": comp.domain,
                "target_level": float(rc.required_level),
                "current_level": current_level,
                "gap": gap
            })
            
        return {
            "role": role.name,
            "radar_data": radar_data
        }
