import time
import json
from apps.labs.models import LabSession

def evaluate_lab_submission(session: LabSession) -> dict:
    """
    Invokes the LLM Evaluation Agent to grade a lab submission.
    Returns a dictionary with 'score' (0-100) and 'feedback'.
    """
    # 1. Gather context
    rubric = session.lab.evaluation_rubric
    user_input = session.user_input
    
    # In a production environment, we would call the Gemini API here:
    # prompt = f"You are an expert evaluator. Score the following submission based on the rubric.\nRubric: {rubric}\nSubmission: {user_input}\nReturn JSON with 'score' and 'feedback'."
    # response = gemini_client.generate_content(prompt)
    # result = json.loads(response.text)
    
    # 2. Simulate LLM processing time and deterministic evaluation for the demo
    time.sleep(1.5) 
    
    if len(user_input.strip()) < 10:
        score = 20
        feedback = "The submission is too short or incomplete. Please write a complete query or script."
    elif "import pandas" in user_input or "SELECT" in user_input.upper():
        score = 88
        feedback = "Excellent approach. You correctly utilized the appropriate libraries/syntax to solve the scenario. Your reasoning is sound, though edge cases could be handled better."
    else:
        score = 65
        feedback = "You made a valid attempt, but the logic does not fully resolve the scenario briefing as outlined in the rubric."
        
    return {
        "score": score,
        "feedback": feedback
    }
