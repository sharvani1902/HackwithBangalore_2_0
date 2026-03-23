import os
import json
import logging
import re
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from groq import Groq
from dotenv import load_dotenv

import db_models
from services.socket_service import broadcast_event
from services.openclaw_service import OpenClaw
from services.insights_service import get_insights

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = """
You are the ProPilot AI Project Manager, a world-class executive assistant and project coordinator. 
Your goal is to help the team manage tasks, decisions, and project intelligence with extreme precision and professionalism.

You have access to the following project management capabilities:
1. CREATE_TASK: { "task_name": str, "assignee": str|null, "deadline_days": int|null }
2. ASSIGN_TASK: { "task_id_or_name": str, "assignee": str }
3. COMPLETE_TASK: { "task_id_or_name": str }
4. LOG_DECISION: { "content": str, "category": str }
5. GET_PROGRESS: General query about who is doing what.
6. GET_ANALYTICS: Query about team performance, bottlenecks, and risk insights.
7. SUMMARIZE_MEETING: Generate a summary and action items from meeting notes.
8. RECALL_MEMORY: Query past decisions or notes via OpenClaw.

INSTRUCTIONS:
- Analyze the user query and decide if an action is needed.
- If an action is needed, include a JSON block in your response starting with `[ACTION]` followed by the JSON parameters.
- Always provide a professional, helpful, and concise response in Markdown.
- Use OpenClaw context if provided to answer specialized questions.
- For Risk Insights, use the data provided in the context to explain bottlenecks.

Example ACTION format:
[ACTION] { "type": "CREATE_TASK", "params": { "task_name": "Setup Database", "assignee": "Alice" } }
"""

async def _execute_llm_action(db: Session, action_type: str, params: dict) -> str:
    """Executes the action on the database/services and returns a confirmation string."""
    try:
        if action_type == "CREATE_TASK":
            name = params.get("task_name")
            assignee = params.get("assignee")
            deadline_days = params.get("deadline_days")
            deadline = datetime.now(timezone.utc) + timedelta(days=deadline_days) if deadline_days is not None else None
            
            new_task = db_models.DBTask(task_name=name, assigned_to=assignee, status="To Do", deadline=deadline)
            db.add(new_task)
            db.commit()
            db.refresh(new_task)
            await broadcast_event("TASK_UPDATED", {"reason": "LLM_CREATED_TASK", "id": new_task.id})
            return f"Successfully created task: **{name}** (Assigned to: {assignee or 'Unassigned'})."

        elif action_type == "ASSIGN_TASK":
            target = params.get("task_id_or_name", "").lower()
            assignee = params.get("assignee")
            task = db.query(db_models.DBTask).filter(db_models.DBTask.task_name.ilike(f"%{target}%")).first()
            if task:
                task.assigned_to = assignee
                db.commit()
                await broadcast_event("TASK_UPDATED", {"reason": "LLM_ASSIGNED_TASK", "id": task.id})
                return f"Task **{task.task_name}** has been assigned to **{assignee}**."
            return f"Could not find a task matching '{target}' to assign."

        elif action_type == "COMPLETE_TASK":
            target = params.get("task_id_or_name", "").lower()
            task = db.query(db_models.DBTask).filter(db_models.DBTask.task_name.ilike(f"%{target}%"), db_models.DBTask.status != "Completed").first()
            if task:
                task.status = "Completed"
                db.commit()
                await broadcast_event("TASK_UPDATED", {"reason": "LLM_COMPLETED_TASK", "id": task.id})
                return f"Great work! Task **{task.task_name}** marked as Completed."
            return f"Could not find an active task matching '{target}'."

        elif action_type == "LOG_DECISION":
            content = params.get("content")
            cat = params.get("category", "General")
            decision = db_models.DBDecision(title="AI Logged Decision", content=content, category=cat, decided_by="Project Team")
            db.add(decision)
            db.commit()
            return f"Decision logged and committed to project memory: _{content}_"

        return ""
    except Exception as e:
        logger.error(f"Action execution failed: {e}")
        return f"Error executing action: {e}"

from services.bot_service import handle_bot_command

async def process_chat_query(db: Session, query: str) -> dict:
    # 0. Check for Bot Commands first
    user = db.query(db_models.DBUser).first() # In real app, this would be current user
    bot_res = await handle_bot_command(db, user, query)
    if bot_res:
        return {"response": bot_res, "context_ref": "BOT_ACTION"}

    if not client:
        return {"response": "LLM Service (Groq) is not configured. Please check your API key.", "context_ref": "ERROR_CONFIG"}

    # Gather Context
    context = ""
    # 1. Fetch relevant memories via OpenClaw
    context += await OpenClaw.query_memory(query)
    
    # 2. Add Risk Insights / Analytics if requested
    if any(kw in query.lower() for kw in ["risk", "bottleneck", "performance", "analytics", "stats", "how are we doing"]):
        insights = await get_insights(db)
        context += f"\n### REAL-TIME PROJECT ANALYTICS:\n"
        context += f"- Best Performing: {insights['best_performing_member']}\n"
        context += f"- Most Delayed: {insights['most_delayed_member']}\n"
        context += f"- Risk Insights: {', '.join(insights['risk_insights']) if insights['risk_insights'] else 'No major risks identified.'}\n"

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUERY: {query}"}
            ],
            temperature=0.2,
            max_tokens=1024
        )
        
        full_text = response.choices[0].message.content
        
        # Parse Actions
        # Improved regex to handle nested braces more reliably for simple cases
        # or better: find [ACTION] and then everything until the end or next [ACTION]
        action_match = re.search(r"\[ACTION\]\s*(\{.*\})", full_text, re.DOTALL)
        final_response = full_text
        context_ref = "AI_REPLY"
        
        if action_match:
            try:
                # Greedy match on {.*} usually works for single action blocks at the end
                raw_json = action_match.group(1).strip()
                # If there are trailing characters after the last }, trim them
                last_brace = raw_json.rfind('}')
                if last_brace != -1:
                    raw_json = raw_json[:last_brace+1]
                
                action_data = json.loads(raw_json)
                action_result = await _execute_llm_action(db, action_data.get("type"), action_data.get("params", {}))
                
                # Update response text without the JSON block
                before_action = full_text[:action_match.start()].strip()
                after_action = full_text[action_match.end():].strip()
                final_response = before_action + "\n\n" + after_action
                final_response += f"\n\n**System Update:** {action_result}"
                context_ref = action_data.get("type")
            except Exception as e:
                logger.error(f"Failed to parse or execute LLM action: {e}. Raw: {action_match.group(1)}")

        return {
            "response": final_response.strip(),
            "context_ref": context_ref
        }

    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return {"response": f"I'm sorry, I'm experiencing some connectivity issues with my brain (Groq). Error: {e}", "context_ref": "ERROR_API"}
