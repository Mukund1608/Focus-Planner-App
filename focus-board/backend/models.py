from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class PriorityLevel(enum.Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class RecurringPattern(enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class ReminderType(enum.Enum):
    NONE = "none"
    EMAIL = "email"
    BROWSER = "browser"
    BOTH = "both"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # SuperTokens user ID
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="user")
    priority_boards = relationship("PriorityBoard", back_populates="user")

class PriorityBoard(Base):
    __tablename__ = "priority_boards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="priority_boards")
    tasks = relationship("Task", back_populates="priority_board")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.MEDIUM)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    due_date = Column(DateTime)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    priority_board_id = Column(Integer, ForeignKey("priority_boards.id"), nullable=False)
    position = Column(Integer, default=0)  # For drag-and-drop ordering
    
    # Reminder and Recurring Task Fields
    reminder_enabled = Column(Boolean, default=False)
    reminder_time = Column(DateTime)  # When to send reminder
    reminder_type = Column(Enum(ReminderType), default=ReminderType.NONE)
    reminder_sent = Column(Boolean, default=False)  # Track if reminder was sent
    
    # Recurring Task Fields
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(Enum(RecurringPattern), default=RecurringPattern.NONE)
    recurring_config = Column(JSON)  # Store custom recurring configuration
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)  # Link to original recurring task
    next_occurrence = Column(DateTime)  # When the next occurrence should be created
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    priority_board = relationship("PriorityBoard", back_populates="tasks")
    # Self-referencing relationship for recurring tasks
    parent_task = relationship("Task", remote_side=[id], backref="child_tasks")
