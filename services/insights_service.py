import ast
import json
import logging
from services.team_service import get_all_member_stats
from services.memory import retrieve_memory
from models import TaskCompletionStats
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

async def get_insights(db: Session) -> dict:
    global_stats = get_all_member_stats(db)
    
    total_completed = 0
    total_delayed = 0
    total_on_time = 0
    total_time_seconds = 0.0
    
    best_member = None
    most_delayed_member = None
    
    max_on_time = -1
    max_delayed = -1
    
    # 1. Evaluate Team Members
    member_performance = {}
    for member_name, stats in global_stats.items():
        completed = stats.get("tasks_completed", 0)
        delayed = stats.get("tasks_delayed", 0)
        time_taken = stats.get("total_completion_time_seconds", 0.0)
        
        total_completed += completed
        total_delayed += delayed
        total_time_seconds += time_taken
        
        on_time = completed - delayed
        total_on_time += on_time
        
        delay_rate = (delayed / completed) if completed > 0 else 0
        member_performance[member_name] = {
            "completed": completed,
            "delayed": delayed,
            "delay_rate": round(delay_rate, 2),
            "avg_time": round(time_taken / completed, 2) if completed > 0 else 0
        }
        
        # Determine best performing based on volume + on-time
        if on_time > max_on_time:
            max_on_time = on_time
            best_member = member_name
            
        # Determine most delayed
        if delayed > max_delayed and delayed > 0:
            max_delayed = delayed
            most_delayed_member = member_name
            
    avg_time = total_time_seconds / total_completed if total_completed > 0 else 0.0
    
    task_stats = TaskCompletionStats(
        total_completed=total_completed,
        total_delayed=total_delayed,
        total_on_time=total_on_time,
        average_time_seconds=round(avg_time, 2)
    )
    
    # 2. Risk Insights (Bottleneck Detection)
    risk_insights = []
    
    # Analyze domain-specific delays from memory
    memory_items = await retrieve_memory(query="task completion report")
    
    domain_stats = {
        "backend": [0, 0], # [total, delayed]
        "frontend": [0, 0],
        "devops": [0, 0]
    }
    
    for item in memory_items:
        try:
            text_content = item if isinstance(item, str) else getattr(item, 'text', str(item))
            # Safely handle JSON or Python literals
            try:
                data = json.loads(text_content) if text_content.strip().startswith('{') else ast.literal_eval(text_content)
            except (json.JSONDecodeError, ValueError, SyntaxError):
                continue
            
            if isinstance(data, dict) and data.get("event") == "task_completed":
                task_name = str(data.get("task_name", "")).lower()
                on_time = data.get("completed_on_time")
                
                for domain, counts in domain_stats.items():
                    if domain in task_name or (domain == "backend" and ("api" in task_name or "database" in task_name)) or (domain == "frontend" and ("ui" in task_name or "react" in task_name)):
                        counts[0] += 1
                        if on_time is False:
                            counts[1] += 1
        except: continue
            
    # Compute bottleneck risks
    for domain, counts in domain_stats.items():
        total, delayed = counts
        if total > 0:
            rate = delayed / total
            if rate >= 0.4:
                risk_insights.append(f"{domain.capitalize()} infrastructure is a significant bottleneck (Delay Rate: {round(rate*100)}%).")
    
    # Add member-specific risk
    if most_delayed_member:
        perf = member_performance[most_delayed_member]
        if perf["delay_rate"] >= 0.5:
            risk_insights.append(f"Member {most_delayed_member} is currently overloaded with a {round(perf['delay_rate']*100)}% delay rate.")
            
    if total_completed > 0 and (total_delayed / total_completed) >= 0.5:
        risk_insights.append("CRITICAL: Project velocity has dropped below 50% due to systemic delays.")
        
    return {
        "best_performing_member": best_member,
        "most_delayed_member": most_delayed_member,
        "member_performance": member_performance,
        "stats": task_stats,
        "risk_insights": risk_insights
    }
