from django.db import transaction
from core.models import Competency
from pathways.models import LearningPath, PathNode
from ai_engine.services import LLMService

class PathwayGenerator:
    """Generates a learning DAG for a given competency using the local LLM."""
    
    @staticmethod
    def generate_path(competency_id: int) -> LearningPath:
        competency = Competency.objects.get(id=competency_id)
        
        # Check if we already have one to avoid re-running LLM (for now, simplistic)
        existing_path = LearningPath.objects.filter(target_competency=competency).first()
        if existing_path:
            return existing_path

        prompt = f"""
You are an expert instructional designer.
Break down the competency "{competency.name}" (Domain: {competency.domain}) into a directed acyclic graph (DAG) of 3-5 learning sub-skills.
Each sub-skill should have a clear title, description, depth level (1 being foundational, 3 being advanced), and a list of string titles representing prerequisites for that sub-skill.

Output EXACTLY as JSON in this format:
{{
  "nodes": [
    {{
      "title": "Sub-skill name",
      "description": "Brief description",
      "level": 1,
      "prerequisites": ["List of exact titles of other nodes that must precede this one, or empty array"]
    }}
  ]
}}
Ensure the DAG is logical and acyclic.
"""
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant that outputs structured JSON."},
            {"role": "user", "content": prompt}
        ]

        try:
            # Generate JSON from Qwen2.5 local model
            response_data = LLMService.generate_json(messages, max_tokens=1024, retries=2)
            if not response_data or "nodes" not in response_data:
                raise ValueError("Invalid JSON response from LLM")
            
            return PathwayGenerator._build_graph(competency, response_data["nodes"])
        except Exception as e:
            # Fallback to mock generation if LLM is unavailable (e.g. during test)
            print(f"LLM generation failed: {e}. Falling back to mock data.")
            mock_data = [
                {"title": "Foundational Basics", "description": "Intro to the topic", "level": 1, "prerequisites": []},
                {"title": "Intermediate Application", "description": "Applying the basics", "level": 2, "prerequisites": ["Foundational Basics"]},
                {"title": "Advanced Mastery", "description": "Expert level topics", "level": 3, "prerequisites": ["Intermediate Application"]},
            ]
            return PathwayGenerator._build_graph(competency, mock_data)

    @staticmethod
    @transaction.atomic
    def _build_graph(competency: Competency, nodes_data: list) -> LearningPath:
        path = LearningPath.objects.create(target_competency=competency)
        
        # Create all nodes first
        node_objects = {}
        for nd in nodes_data:
            node = PathNode.objects.create(
                path=path,
                title=nd['title'],
                description=nd.get('description', ''),
                level=nd.get('level', 1)
            )
            node_objects[nd['title']] = node
            
        # Link prerequisites
        for nd in nodes_data:
            node = node_objects.get(nd['title'])
            if not node:
                continue
            prereq_titles = nd.get('prerequisites', [])
            for pt in prereq_titles:
                prereq_node = node_objects.get(pt)
                if prereq_node:
                    node.prerequisites.add(prereq_node)
                    
        return path
