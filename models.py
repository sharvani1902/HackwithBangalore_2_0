from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "To Do"
    assignee: Optional[str] = None


class TaskModel(TaskBase):
    id: int


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectModel(ProjectBase):
    id: int
    created_at: datetime
    tasks: List[TaskModel] = []


class TeamMemberCreate(BaseModel):
    name: str
    skills: Optional[str] = "Generalist"
    role: Optional[str] = "Team Member"  # e.g., 'Backend Engineer', 'Frontend Developer'

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[str] = None
    role: Optional[str] = None


class TeamMember(TeamMemberCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class DecisionCreate(BaseModel):
    title: str
    content: str
    decided_by: str
    category: Optional[str] = "General"


class Decision(DecisionCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TaskItemCreate(BaseModel):
    task_name: str
    assigned_to: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str = "To Do"  # To Do, In Progress, Completed
    priority: str = "Medium"
    difficulty: str = "Medium"
    ai_rationale: Optional[str] = None
    confidence_score: Optional[float] = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TaskItem(TaskItemCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TaskItemUpdate(BaseModel):
    task_name: Optional[str] = None
    assigned_to: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    difficulty: Optional[str] = None
    ai_rationale: Optional[str] = None
    confidence_score: Optional[float] = None


class TaskSuggestionResponse(BaseModel):
    suggested_member: Optional[str] = None
    confidence: float
    reason: str

class TaskCompletionStats(BaseModel):
    total_completed: int
    total_delayed: int
    total_on_time: int
    average_time_seconds: float

class InsightsResponse(BaseModel):
    best_performing_member: Optional[str] = None
    most_delayed_member: Optional[str] = None
    stats: TaskCompletionStats
    risk_insights: List[str]

# --- Auth Models ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str = "member"
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Meeting Models ---
class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    reminder_time: int = 0
    project_association: Optional[str] = None

class MeetingCreate(MeetingBase):
    participants: List[str] = []

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reminder_time: Optional[int] = None
    project_association: Optional[str] = None
    participants: Optional[List[str]] = None

class MeetingResponse(MeetingBase):
    id: int
    created_by: str
    outlook_event_id: Optional[str] = None
    created_at: datetime
    participants: List[str] = []
    
    model_config = ConfigDict(from_attributes=True)

# --- Meeting AI Models ---

class TranscriptCreate(BaseModel):
    meeting_id: int
    speaker: Optional[str] = None
    text: str

class TranscriptResponse(BaseModel):
    id: int
    meeting_id: int
    speaker: Optional[str] = None
    text: str
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RecordingCreate(BaseModel):
    meeting_id: int
    recording_url: str
    duration: Optional[int] = None

class RecordingResponse(BaseModel):
    id: int
    meeting_id: int
    recording_url: str
    duration: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SummaryResponse(BaseModel):
    id: int
    meeting_id: int
    overview: str
    key_points: List[str]
    action_items: List[dict] # { "task": "...", "assignee": "..." } or simple List[str]
    next_steps: List[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Integration Models ---
class IntegrationBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class IntegrationResponse(IntegrationBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class UserIntegrationBase(BaseModel):
    integration_id: int

class UserIntegrationResponse(UserIntegrationBase):
    id: int
    user_id: int
    is_connected: bool
    connection_metadata: Optional[str] = None
    last_sync: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Automation Models ---
class AutomationRuleBase(BaseModel):
    trigger_type: str
    action_type: str
    config: str # JSON stringified
    is_active: Optional[bool] = True

class AutomationRuleCreate(AutomationRuleBase):
    pass

class AutomationRuleResponse(AutomationRuleBase):
    id: int
    user_id: int
    last_triggered: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Reporting Models ---
class ReportDataPoint(BaseModel):
    label: str
    value: float

class ReportResponse(BaseModel):
    success: bool
    data: List[dict] # Generic data list for different report types
    summary: Optional[dict] = None

class GlobalActivityReport(BaseModel):
    completion_rate: float
    total_tasks: int
    active_members: int
    daily_velocity: List[ReportDataPoint]


