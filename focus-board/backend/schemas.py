from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import PriorityLevel, TaskStatus

# Base schemas
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: PriorityLevel = PriorityLevel.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None

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

class PriorityBoardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

# Response schemas
class TaskResponse(TaskBase):
    id: int
    user_id: str
    priority_board_id: int
    position: int
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
