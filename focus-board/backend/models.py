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

class HabitFrequency(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # SuperTokens user ID
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="user")
    priority_boards = relationship("PriorityBoard", back_populates="user")
    habits = relationship("Habit", back_populates="user")

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

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    frequency = Column(Enum(HabitFrequency), default=HabitFrequency.DAILY)
    target_count = Column(Integer, default=1)  # How many times per frequency period
    current_streak = Column(Integer, default=0)  # Current consecutive streak
    longest_streak = Column(Integer, default=0)  # Longest streak achieved
    total_completions = Column(Integer, default=0)  # Total times completed
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    color = Column(String, default="#667eea")  # Custom color for the habit
    icon = Column(String, default="🔄")  # Emoji icon for the habit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="habits")
    completions = relationship("HabitCompletion", back_populates="habit", cascade="all, delete-orphan")

class HabitCompletion(Base):
    __tablename__ = "habit_completions"
    
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)  # Optional notes for the completion
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="completions")

# Exam Mode Models
class ExamDifficulty(enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class ExamInputs(Base):
    __tablename__ = "exam_inputs"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subjects = Column(JSON, nullable=False)  # Array of subject objects
    daily_hours = Column(Integer, nullable=False)  # Stored as minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="exam_inputs")

class ExamSchedule(Base):
    __tablename__ = "schedules"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String, default="active")  # active, archived
    from_date = Column(DateTime, nullable=False)
    to_date = Column(DateTime, nullable=False)
    params = Column(JSON, nullable=False)  # Snapshot of inputs + algorithm config
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="exam_schedules")
    days = relationship("ExamScheduleDay", back_populates="schedule", cascade="all, delete-orphan")

class ExamScheduleDay(Base):
    __tablename__ = "schedule_days"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    schedule_id = Column(String, ForeignKey("schedules.id"), nullable=False)
    day = Column(DateTime, nullable=False)
    total_planned_minutes = Column(Integer, nullable=False)
    
    # Relationships
    schedule = relationship("ExamSchedule", back_populates="days")
    tasks = relationship("ExamTask", back_populates="schedule_day", cascade="all, delete-orphan")

class ExamTask(Base):
    __tablename__ = "exam_tasks"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    schedule_day_id = Column(String, ForeignKey("schedule_days.id"), nullable=False)
    subject_id = Column(String, nullable=False)
    subject_name = Column(String, nullable=False)
    difficulty = Column(Enum(ExamDifficulty), nullable=False)
    planned_minutes = Column(Integer, nullable=False)
    pomodoro_blocks = Column(Integer, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    schedule_day = relationship("ExamScheduleDay", back_populates="tasks")

class NotificationPreferences(Base):
    __tablename__ = "notification_prefs"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    am_enabled = Column(Boolean, default=True)
    am_time = Column(String, default="09:00")  # HH:mm format
    pm_enabled = Column(Boolean, default=True)
    pm_time = Column(String, default="20:00")  # HH:mm format
    tz = Column(String, default="Asia/Kolkata")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="notification_preferences")
