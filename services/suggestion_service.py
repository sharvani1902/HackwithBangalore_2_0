import ast
import json
import logging
import re
from sqlalchemy.orm import Session
from services.memory import retrieve_memory
from services.team_service import get_all_member_stats
from db_models import DBTeamMember

logger = logging.getLogger(__name__)

def semantic_score(task_name: str, member_skills: str) -> float:
    """
    Very basic semantic similarity mock. In a real app, this would use embeddings.
    Here we use keyword intersection and phrase matching.
    """
    if not member_skills:
        return 0.0
    
    task_words = set(re.findall(r'\w+', task_name.lower()))
    skill_words = set(re.findall(r'\w+', member_skills.lower()))
    
    # Calculate intersection
    overlap = task_words.intersection(skill_words)
    
    # Weight overlaps
    score = len(overlap) * 2.0
    
    # Check for specific strong matches (e.g. 'ui' in task and 'frontend' in skills)
    if ("ui" in task_words or "frontend" in task_words) and ("ui" in skill_words or "frontend" in skill_words):
        score += 3.0
    if ("backend" in task_words or "api" in task_words) and ("backend" in skill_words or "api" in skill_words):
        score += 3.0
    if ("database" in task_words or "sql" in task_words) and ("database" in skill_words or "sql" in skill_words):
        score += 3.0
        
    return score

def suggest_assignee(db: Session, task_name: str) -> dict:
    """
    Upgraded semantic suggestion engine.
    Combines:
    1. Historical Performance (from Hindsight memory)
    2. Semantic Matching (Task description vs Member Skills)
    3. Global Performance (Completion rates)
    """
    # 1. Historical Memory Logic
    memory_items = retrieve_memory(query=task_name)
    scoring = {}
    total_relevant_events = 0

    for item in memory_items:
        try:
            text_content = item if isinstance(item, str) else getattr(item, 'text', str(item))
            try:
                data = json.loads(text_content) if text_content.strip().startswith('{') else ast.literal_eval(text_content)
            except (json.JSONDecodeError, ValueError, SyntaxError):
                continue
            if not isinstance(data, dict) or data.get("event") != "task_completed":
                continue

            assignee = data.get("assigned_to")
            if not assignee: continue

            if assignee not in scoring: scoring[assignee] = 0.0
            total_relevant_events += 1
            scoring[assignee] += 1.0 if data.get("completed_on_time") else -1.0
        except: continue

    # 2. Semantic Skills Matching
    members = db.query(DBTeamMember).all()
    for member in members:
        if member.name not in scoring:
            scoring[member.name] = 0.0
        
        match_score = semantic_score(task_name, member.skills)
        scoring[member.name] += match_score
        logger.debug(f"Semantic match for {member.name}: {match_score}")

    # 3. Global Stats weighting
    global_stats = get_all_member_stats(db)
    for m_name, stats in global_stats.items():
        if m_name in scoring:
            scoring[m_name] += (stats.get("tasks_completed", 0) * 0.5)
            scoring[m_name] -= (stats.get("tasks_delayed", 0) * 1.0)

    if not scoring or all(s == 0 for s in scoring.values()):
        return {
            "suggested_member": None,
            "confidence": 0.0,
            "reason": "AI is still indexing project skills. No strong match found yet."
        }

    # Rank results
    best_member_name = max(scoring.items(), key=lambda x: x[1])[0]
    final_score = scoring[best_member_name]
    
    # Calculate confidence based on score magnitude and history
    confidence = min(0.95, (final_score / 15.0) + (total_relevant_events * 0.05))
    if confidence < 0.3: confidence = 0.3 # Baseline

    # Identify primary reason
    member_obj = db.query(DBTeamMember).filter(DBTeamMember.name == best_member_name).first()
    semantic_match = semantic_score(task_name, member_obj.skills) if member_obj else 0
    
    if semantic_match > 5:
        reason = f"Strong semantic match! {best_member_name}'s skills ({member_obj.skills if member_obj else ''}) perfectly align with this task."
    elif total_relevant_events > 2:
        reason = f"Historical evidence: {best_member_name} has a proven track record with {total_relevant_events} similar tasks."
    else:
        reason = f"Balanced choice: {best_member_name} shows the best combination of availability and foundational skills."

    return {
        "suggested_member": best_member_name,
        "confidence": round(confidence, 2),
        "reason": reason
    }
