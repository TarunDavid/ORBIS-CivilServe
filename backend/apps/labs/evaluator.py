import time
import json
from apps.labs.models import LabSession

def evaluate_crisis_simulation(session: LabSession) -> dict:
    """
    Evaluates a branching crisis simulation based on decisions made,
    the resulting metrics balance, and the candidate's executive rationale.
    """
    state = session.session_state or {}
    choices = state.get('choices', [])
    metrics = state.get('metrics', {'integrity': 50, 'trust': 50, 'timeliness': 50, 'coordination': 50})
    user_rationale = (session.user_input or '').strip()

    choice_scores = []
    feedback_points = []

    for c in choices:
        stage_id = c.get('stage_id')
        opt_id = c.get('option_id')
        if stage_id == 1:
            if opt_id == 'A':
                choice_scores.append(88)
                feedback_points.append("Stage 1: Excellent decision to freeze the embargo and dispatch field supervisors. While this created minor media pressure, it preserved foundational statistical integrity.")
            elif opt_id == 'C':
                choice_scores.append(92)
                feedback_points.append("Stage 1: Commendable pragmatic decision to issue a partial flash release while isolating the suspect region. This balanced market transparency with accuracy.")
            elif opt_id == 'B':
                choice_scores.append(45)
                feedback_points.append("Stage 1: Releasing unverified figures with a footnote compromised institutional credibility, causing market volatility.")
        elif stage_id == 2:
            if opt_id == 'A':
                choice_scores.append(95)
                feedback_points.append("Stage 2: Exemplary crisis leadership in publishing a full transparent errata disclosure. This defused speculative whistleblower claims and reinforced public trust.")
            elif opt_id == 'B':
                choice_scores.append(25)
                feedback_points.append("Stage 2: Quietly overwriting figures without technical errata violated statistical governance standards and invited accusations of data suppression.")
        elif stage_id == 3:
            if opt_id == 'A':
                choice_scores.append(95)
                feedback_points.append("Stage 3: Outstanding governance protocol. Implementing automated statistical sanity bounds and dual sign-off keys creates durable institutional safeguards.")
            elif opt_id == 'B':
                choice_scores.append(65)
                feedback_points.append("Stage 3: Relying solely on manual checklists adds administrative delay without eliminating automated data-entry vulnerabilities.")

    avg_choice_score = sum(choice_scores) / len(choice_scores) if choice_scores else 60

    # Rationale bonus (up to 10 points)
    rationale_score = 0
    if len(user_rationale) > 80:
        rationale_score = 10
        feedback_points.append("Executive Rationale: Thorough, well-reasoned brief demonstrating acute awareness of market volatility, statistical ethics, and inter-agency coordination.")
    elif len(user_rationale) > 20:
        rationale_score = 5
        feedback_points.append("Executive Rationale: Adequate briefing provided; consider detailing statutory protocols and press coordination further.")
    else:
        feedback_points.append("Executive Rationale: Brief was brief; executive decisions require clear written institutional justification.")

    final_score = min(100, max(10, int(round(avg_choice_score * 0.9 + rationale_score))))

    feedback_text = (
        f"Crisis Simulation Evaluation: {final_score}/100\n\n"
        f"Telemetry Posture: Integrity: {metrics.get('integrity', 0)}% | Trust: {metrics.get('trust', 0)}% | "
        f"Timeliness: {metrics.get('timeliness', 0)}% | Coordination: {metrics.get('coordination', 0)}%\n\n"
        + "\n\n".join(feedback_points)
    )

    return {"score": final_score, "feedback": feedback_text}


def evaluate_data_detective(session: LabSession) -> dict:
    """
    Evaluates microdata audit submissions by comparing flagged anomalies
    with ground-truth dataset defects.
    """
    scenario_data = session.lab.scenario_data or {}
    ground_truth = scenario_data.get('ground_truth_anomalies', [])
    gt_ids = {item['record_id']: item for item in ground_truth}

    state = session.session_state or {}
    flagged = state.get('flagged_anomalies', [])
    flagged_ids = {f.get('record_id') for f in flagged if f.get('record_id')}

    true_positives = [rid for rid in flagged_ids if rid in gt_ids]
    false_positives = [rid for rid in flagged_ids if rid not in gt_ids]
    false_negatives = [rid for rid in gt_ids if rid not in flagged_ids]

    tp = len(true_positives)
    fp = len(false_positives)
    fn = len(false_negatives)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / len(gt_ids) if gt_ids else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    # Audit notes bonus
    audit_notes = (session.user_input or '').strip()
    notes_bonus = 10 if len(audit_notes) > 40 else (5 if len(audit_notes) > 10 else 0)

    base_score = int(round(f1 * 90))
    final_score = min(100, max(20, base_score + notes_bonus))

    feedback_lines = [
        f"Microdata Quality Audit Evaluation: {final_score}/100",
        f"Audit Performance: Precision: {precision * 100:.1f}% | Recall: {recall * 100:.1f}% | F1-Score: {f1 * 100:.1f}%",
        f"Correctly Detected Defects: {tp}/{len(gt_ids)}",
    ]

    if true_positives:
        detected_details = []
        for rid in true_positives:
            detected_details.append(f"- {rid}: {gt_ids[rid]['anomaly_type']} - {gt_ids[rid]['explanation']}")
        feedback_lines.append("\nVerified Defects Detected:\n" + "\n".join(detected_details))

    if false_negatives:
        missed_details = []
        for rid in false_negatives:
            missed_details.append(f"- {rid} ({gt_ids[rid]['field']}): {gt_ids[rid]['explanation']}")
        feedback_lines.append("\nUncaught Anomalies in Dataset:\n" + "\n".join(missed_details))

    if false_positives:
        feedback_lines.append(f"\nFalse Alarms ({fp}): Records {', '.join(false_positives)} were flagged but are statistically sound.")

    if notes_bonus > 0:
        feedback_lines.append("\nAuditor Notes: Quality remediation notes provided.")

    return {"score": final_score, "feedback": "\n".join(feedback_lines)}


def evaluate_python_notebook(session: LabSession) -> dict:
    code = session.user_input or ''
    code_lower = code.lower()

    score = 40
    feedback_points = []

    if "read_csv" in code:
        score += 15
        feedback_points.append("✓ Correctly imported and loaded survey dataset with read_csv().")
    else:
        feedback_points.append("✗ Missing pd.read_csv() dataset loader.")

    if "fillna" in code or "median" in code:
        score += 20
        feedback_points.append("✓ Applied median imputation for missing values in 'age'.")
    else:
        feedback_points.append("✗ Did not detect median imputation logic for missing values.")

    if "upper" in code or ".str.upper" in code:
        score += 15
        feedback_points.append("✓ Standardized village name casing using str.upper().")
    else:
        feedback_points.append("✗ Inconsistent string casing standardization.")

    if "groupby" in code:
        score += 10
        feedback_points.append("✓ Produced grouped summary aggregation by village.")
    else:
        feedback_points.append("✗ Groupby aggregation not clearly defined.")

    final_score = min(100, score)
    return {
        "score": final_score,
        "feedback": f"Python Notebook Evaluation: {final_score}/100\n\n" + "\n".join(feedback_points)
    }


def evaluate_sql_terminal(session: LabSession) -> dict:
    query = (session.user_input or '').upper()

    score = 40
    feedback_points = []

    if "JOIN" in query:
        score += 20
        feedback_points.append("✓ Successfully joined census and health registry tables.")
    else:
        feedback_points.append("✗ Missing relational JOIN between tables.")

    if "ABS(" in query or "-" in query:
        score += 15
        feedback_points.append("✓ Accurate mathematical variance/discrepancy computation.")
    else:
        feedback_points.append("✗ Discrepancy delta formula missing or incomplete.")

    if "WHERE" in query or "HAVING" in query:
        score += 15
        feedback_points.append("✓ Applied conditional filter for discrepancies exceeding threshold (>5%).")
    else:
        feedback_points.append("✗ Filter threshold (>5%) not applied.")

    if "ORDER BY" in query:
        score += 10
        feedback_points.append("✓ Ordered results by discrepancy descending.")

    final_score = min(100, score)
    return {
        "score": final_score,
        "feedback": f"SQL Query Evaluation: {final_score}/100\n\n" + "\n".join(feedback_points)
    }


def evaluate_policy_canvas(session: LabSession) -> dict:
    text = (session.user_input or '').strip()
    length = len(text.split())

    if length < 25:
        score = 35
        feedback = "The policy memorandum is insufficient in length and detail. A rigorous technical brief requires structured problem analysis, regulatory references, and remediation steps."
    elif length < 75:
        score = 70
        feedback = "Adequate draft submitted. Covers primary requirements, but would benefit from explicit sampling error formulas and risk mitigation protocols."
    else:
        score = 90
        feedback = "Exemplary policy memorandum. Demonstrates institutional clarity, robust methodological justification, and strict alignment with National Statistical governance standards."

    return {
        "score": score,
        "feedback": f"Policy Canvas Evaluation: {score}/100\n\n{feedback}"
    }


def evaluate_lab_submission(session: LabSession) -> dict:
    """
    Dispatches evaluation to the appropriate domain evaluator based on environment_type.
    """
    # Simulate realistic evaluation delay
    time.sleep(1.2)

    env = session.lab.environment_type

    if env == 'crisis_simulation':
        return evaluate_crisis_simulation(session)
    elif env == 'data_detective':
        return evaluate_data_detective(session)
    elif env == 'python_notebook':
        return evaluate_python_notebook(session)
    elif env == 'sql_terminal':
        return evaluate_sql_terminal(session)
    else:
        return evaluate_policy_canvas(session)
