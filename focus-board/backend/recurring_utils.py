from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models import Task, RecurringPattern, TaskStatus
from schemas import RecurringConfig
import calendar

def calculate_next_occurrence(
    base_date: datetime,
    pattern: RecurringPattern,
    config: RecurringConfig,
    current_occurrence: Optional[datetime] = None
) -> Optional[datetime]:
    """
    Calculate the next occurrence date for a recurring task
    """
    if pattern == RecurringPattern.NONE:
        return None
    
    # Use current occurrence as base if provided, otherwise use base_date
    start_date = current_occurrence or base_date
    
    if pattern == RecurringPattern.DAILY:
        next_date = start_date + timedelta(days=config.interval)
    
    elif pattern == RecurringPattern.WEEKLY:
        next_date = start_date + timedelta(weeks=config.interval)
        
        # If weekdays are specified, adjust to the next valid weekday
        if config.weekdays:
            current_weekday = start_date.weekday()
            next_weekday = None
            
            # Find the next weekday in the list
            for weekday in config.weekdays:
                if weekday > current_weekday:
                    next_weekday = weekday
                    break
            
            # If no weekday found in current week, take the first one from next week
            if next_weekday is None:
                next_weekday = config.weekdays[0]
                next_date = start_date + timedelta(weeks=config.interval)
            
            # Adjust to the correct weekday
            days_diff = next_weekday - start_date.weekday()
            if days_diff <= 0:
                days_diff += 7
            next_date = start_date + timedelta(days=days_diff)
    
    elif pattern == RecurringPattern.MONTHLY:
        # Add months by incrementing year and month
        year = start_date.year
        month = start_date.month + config.interval
        
        # Handle year rollover
        while month > 12:
            year += 1
            month -= 12
        
        # Handle end of month edge cases
        try:
            next_date = start_date.replace(year=year, month=month)
        except ValueError:
            # Handle cases like Jan 31 -> Feb 28/29
            last_day = calendar.monthrange(year, month)[1]
            next_date = start_date.replace(year=year, month=month, day=last_day)
    
    elif pattern == RecurringPattern.CUSTOM:
        # For custom patterns, use the interval as days
        next_date = start_date + timedelta(days=config.interval)
    
    else:
        return None
    
    # Check if we've exceeded the end date
    if config.end_date and next_date > config.end_date:
        return None
    
    return next_date

def should_create_next_occurrence(task: Task) -> bool:
    """
    Determine if a new occurrence should be created for a recurring task
    """
    if not task.is_recurring or task.recurring_pattern == RecurringPattern.NONE:
        return False
    
    # If task is completed and has a next_occurrence date
    if task.status.value == "completed" and task.next_occurrence:
        # Check if it's time to create the next occurrence
        return datetime.utcnow() >= task.next_occurrence
    
    return False

def create_next_occurrence(task: Task, db) -> Optional[Task]:
    """
    Create the next occurrence of a recurring task
    """
    if not task.is_recurring or not task.recurring_config:
        return None
    
    config = RecurringConfig(**task.recurring_config)
    
    # Calculate next occurrence date
    next_date = calculate_next_occurrence(
        task.due_date or task.created_at,
        task.recurring_pattern,
        config,
        task.next_occurrence
    )
    
    if not next_date:
        return None
    
    # Check max occurrences limit
    if config.max_occurrences:
        existing_occurrences = db.query(Task).filter(
            Task.parent_task_id == task.parent_task_id or Task.id == task.parent_task_id
        ).count()
        
        if existing_occurrences >= config.max_occurrences:
            return None
    
    # Create new task occurrence
    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=TaskStatus.PENDING,
        due_date=next_date,
        user_id=task.user_id,
        priority_board_id=task.priority_board_id,
        position=task.position,
        
        # Reminder settings
        reminder_enabled=task.reminder_enabled,
        reminder_time=task.reminder_time,
        reminder_type=task.reminder_type,
        reminder_sent=False,
        
        # Recurring settings
        is_recurring=task.is_recurring,
        recurring_pattern=task.recurring_pattern,
        recurring_config=task.recurring_config,
        parent_task_id=task.parent_task_id or task.id,
        next_occurrence=calculate_next_occurrence(
            task.due_date or task.created_at,
            task.recurring_pattern,
            config,
            next_date
        )
    )
    
    return new_task

def get_recurring_tasks_due_soon(db, user_id: str, hours_ahead: int = 24) -> List[Task]:
    """
    Get recurring tasks that are due soon and need next occurrences created
    """
    cutoff_time = datetime.utcnow() + timedelta(hours=hours_ahead)
    
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_recurring == True,
        Task.status == TaskStatus.COMPLETED,
        Task.next_occurrence <= cutoff_time
    ).all()

def calculate_reminder_time(due_date: datetime, advance_minutes: int) -> datetime:
    """
    Calculate when a reminder should be sent
    """
    return due_date - timedelta(minutes=advance_minutes)
