from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import PriorityLevel, TaskStatus, RecurringPattern, ReminderType

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
    priority_board_id: int

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
