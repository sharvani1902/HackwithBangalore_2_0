from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime, timezone

class DBTeamMember(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    skills = Column(String, default="Generalist")
    role = Column(String, default="Team Member")  # e.g. 'Backend Engineer'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBTask(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, index=True)
    assigned_to = Column(String, index=True, nullable=True)
    status = Column(String, default="To Do")  # To Do, In Progress, Completed
    priority = Column(String, default="Medium")  # High, Medium, Low
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    ai_rationale = Column(String, nullable=True)
    confidence_score = Column(Integer, default=0)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DBDecision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)  # Full decision text
    decided_by = Column(String)  # User/team who made the decision
    category = Column(String, default="General")  # e.g. 'Architecture', 'Process', 'Hiring'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBMeeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    created_by = Column(String) # usually username
    reminder_time = Column(Integer, default=0) # e.g. 10, 30, 60 minutes
    outlook_event_id = Column(String, nullable=True)
    project_association = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBMeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, index=True)
    participant_name = Column(String, index=True)

class DBMeetingTranscript(Base):
    __tablename__ = "meeting_transcripts"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, index=True)
    speaker = Column(String, nullable=True)
    text = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBMeetingRecording(Base):
    __tablename__ = "meeting_recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, index=True)
    recording_url = Column(String)
    duration = Column(Integer, nullable=True) # seconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBMeetingSummary(Base):
    __tablename__ = "meeting_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, unique=True, index=True)
    overview = Column(String)
    key_points = Column(String) # Stored as stringified JSON array
    action_items = Column(String) # Stored as stringified JSON array
    next_steps = Column(String) # Stored as stringified JSON array
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBIntegration(Base):
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True) # e.g. 'ms365', 'github', 'trello'
    description = Column(String)
    icon = Column(String) # Icon name or SVG path
    is_active = Column(Integer, default=1)

class DBUserIntegration(Base):
    __tablename__ = "user_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    integration_id = Column(Integer, index=True)
    is_connected = Column(Integer, default=0) # 0 or 1
    connection_metadata = Column(String, nullable=True) # JSON config
    last_sync = Column(DateTime, nullable=True)

class DBIntegrationToken(Base):
    __tablename__ = "integration_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    integration_slug = Column(String, index=True)
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    token_type = Column(String, default="Bearer")
    expires_at = Column(DateTime, nullable=True)
    scope = Column(String, nullable=True)

class DBAutomationRule(Base):
    __tablename__ = "automation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    trigger_type = Column(String) # e.g. 'TASK_COMPLETED', 'MEETING_SCHEDULED'
    action_type = Column(String) # e.g. 'CHAT_NOTIFY', 'CREATE_TASK'
    config = Column(String) # JSON containing trigger/action parameters
    is_active = Column(Integer, default=1)
    last_triggered = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

