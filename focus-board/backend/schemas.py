from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import PriorityLevel, TaskStatus, RecurringPattern, ReminderType, HabitFrequency

# Base schemas
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: PriorityLevel = PriorityLevel.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    
    # Reminder fields
    reminder_enabled: bool = False
    reminder_time: Optional[datetime] = None
    reminder_type: ReminderType = ReminderType.NONE
    
    # Recurring task fields
    is_recurring: bool = False
    recurring_pattern: RecurringPattern = RecurringPattern.NONE
    recurring_config: Optional[Dict[str, Any]] = None

class PriorityBoardBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

# Create schemas
class TaskCreate(TaskBase):
    priority_board_id: Optional[int] = None

class PriorityBoardCreate(PriorityBoardBase):
    pass

# Update schemas
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[PriorityLevel] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    position: Optional[int] = None
    
    # Reminder fields
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None
    reminder_type: Optional[ReminderType] = None
    
    # Recurring task fields
    is_recurring: Optional[bool] = None
    recurring_pattern: Optional[RecurringPattern] = None
    recurring_config: Optional[Dict[str, Any]] = None

class PriorityBoardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

# Response schemas
class TaskResponse(TaskBase):
    id: int
    user_id: str
    priority_board_id: int
    position: int
    reminder_sent: bool
    parent_task_id: Optional[int] = None
    next_occurrence: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PriorityBoardResponse(PriorityBoardBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True

class TaskReorderRequest(BaseModel):
    task_id: int
    new_position: int
    new_priority_board_id: Optional[int] = None

class TaskBulkUpdateRequest(BaseModel):
    task_ids: List[int]
    updates: TaskUpdate

# New schemas for recurring tasks and reminders
class RecurringConfig(BaseModel):
    interval: int = Field(1, ge=1)  # Every X days/weeks/months
    weekdays: Optional[List[int]] = Field(None)  # 0=Monday, 6=Sunday
    end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = Field(None, ge=1)

class ReminderConfig(BaseModel):
    enabled: bool = False
    time: Optional[datetime] = None
    type: ReminderType = ReminderType.NONE
    advance_minutes: int = Field(15, ge=0)  # How many minutes before due date

class CreateRecurringTaskRequest(BaseModel):
    base_task: TaskCreate
    recurring_config: RecurringConfig

class UpdateRecurringTaskRequest(BaseModel):
    task_id: int
    updates: TaskUpdate
    recurring_config: Optional[RecurringConfig] = None

# Habit schemas
class HabitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: HabitFrequency = HabitFrequency.DAILY
    target_count: int = Field(1, ge=1, le=100)
    color: str = Field("#667eea", pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: str = Field("🔄", max_length=10)

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: Optional[HabitFrequency] = None
    target_count: Optional[int] = Field(None, ge=1, le=100)
    is_active: Optional[bool] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=10)

class HabitCompletionCreate(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)

class HabitCompletionResponse(BaseModel):
    id: int
    habit_id: int
    completed_at: datetime
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class HabitResponse(HabitBase):
    id: int
    user_id: str
    current_streak: int
    longest_streak: int
    total_completions: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    completions: List[HabitCompletionResponse] = []
    
    class Config:
        from_attributes = True

class HabitStats(BaseModel):
    total_habits: int
    active_habits: int
    total_completions_today: int
    total_completions_this_week: int
    total_completions_this_month: int
    average_streak: float
    longest_current_streak: int

# Exam Mode Schemas
from models import ExamDifficulty

class ExamSubjectBase(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    examDate: str = Field(..., description="ISO date string")
    difficulty: ExamDifficulty = ExamDifficulty.MEDIUM
    weightOverride: Optional[float] = Field(None, ge=0.5, le=3.0)

class ExamScheduleGenerateRequest(BaseModel):
    subjects: List[ExamSubjectBase] = Field(..., min_items=1)
    dailyHours: float = Field(..., ge=0.5, le=16.0)
    startDate: Optional[str] = Field(None, description="ISO date string")
    reserveRevision: Optional[bool] = Field(True, description="Whether to reserve revision days")
    blockMinutes: Optional[int] = Field(50, ge=15, le=120)
    shortBreakMinutes: Optional[int] = Field(10, ge=5, le=30)
    longBreakMinutes: Optional[int] = Field(20, ge=10, le=60)
    longBreakEveryNBlocks: Optional[int] = Field(3, ge=1, le=10)

class ExamTaskResponse(BaseModel):
    id: str
    subjectId: str
    subjectName: str
    difficulty: ExamDifficulty
    plannedMinutes: int
    pomodoroBlocks: int
    completedAt: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class ExamScheduleDayResponse(BaseModel):
    day: str  # ISO date string
    totalPlannedMinutes: int
    tasks: List[ExamTaskResponse]
    
    class Config:
        from_attributes = True

class ExamScheduleResponse(BaseModel):
    scheduleId: str
    version: int
    fromDate: str  # ISO date string
    toDate: str  # ISO date string
    days: List[ExamScheduleDayResponse]
    
    class Config:
        from_attributes = True

class ExamScheduleGetResponse(BaseModel):
    day: Optional[str] = None  # ISO date string
    tasks: Optional[List[ExamTaskResponse]] = None
    schedule: Optional[ExamScheduleResponse] = None

class ExamTaskCompletionRequest(BaseModel):
    taskId: str
    completed: bool

class NotificationPreferencesRequest(BaseModel):
    amEnabled: Optional[bool] = None
    amTime: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    pmEnabled: Optional[bool] = None
    pmTime: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    tz: Optional[str] = None

class NotificationPreferencesResponse(BaseModel):
    amEnabled: bool
    amTime: str
    pmEnabled: bool
    pmTime: str
    tz: str
    
    class Config:
        from_attributes = True
