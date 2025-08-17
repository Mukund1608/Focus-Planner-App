from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from models import Task, PriorityBoard, User, PriorityLevel, TaskStatus, RecurringPattern, ReminderType
from schemas import TaskCreate, TaskUpdate, PriorityBoardCreate, PriorityBoardUpdate, RecurringConfig
from recurring_utils import create_next_occurrence, calculate_reminder_time
from datetime import datetime

# Priority Board CRUD operations
def create_priority_board(db: Session, priority_board: PriorityBoardCreate, user_id: str) -> PriorityBoard:
    db_priority_board = PriorityBoard(
        name=priority_board.name,
        user_id=user_id
    )
    db.add(db_priority_board)
    db.commit()
    db.refresh(db_priority_board)
    return db_priority_board

def get_priority_board(db: Session, priority_board_id: int, user_id: str) -> Optional[PriorityBoard]:
    return db.query(PriorityBoard).filter(
        and_(PriorityBoard.id == priority_board_id, PriorityBoard.user_id == user_id)
    ).first()

def get_priority_boards(db: Session, user_id: str) -> List[PriorityBoard]:
    return db.query(PriorityBoard).filter(PriorityBoard.user_id == user_id).all()

def update_priority_board(db: Session, priority_board_id: int, priority_board: PriorityBoardUpdate, user_id: str) -> Optional[PriorityBoard]:
    db_priority_board = get_priority_board(db, priority_board_id, user_id)
    if db_priority_board:
        update_data = priority_board.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_priority_board, field, value)
        db.commit()
        db.refresh(db_priority_board)
    return db_priority_board

def delete_priority_board(db: Session, priority_board_id: int, user_id: str) -> bool:
    db_priority_board = get_priority_board(db, priority_board_id, user_id)
    if db_priority_board:
        db.delete(db_priority_board)
        db.commit()
        return True
    return False

# Task CRUD operations
def create_task(db: Session, task: TaskCreate, user_id: str) -> Task:
    # Get the next position for the priority board
    max_position = db.query(Task).filter(
        Task.priority_board_id == task.priority_board_id
    ).count()
    
    # Calculate reminder time if reminder is enabled
    reminder_time = None
    if task.reminder_enabled and task.due_date:
        from recurring_utils import calculate_reminder_time
        reminder_time = calculate_reminder_time(task.due_date, 15)  # Default 15 minutes advance
    
    # Calculate next occurrence for recurring tasks
    next_occurrence = None
    if task.is_recurring and task.recurring_config:
        from recurring_utils import calculate_next_occurrence
        config = RecurringConfig(**task.recurring_config)
        next_occurrence = calculate_next_occurrence(
            task.due_date or datetime.utcnow(),
            task.recurring_pattern,
            config
        )
    
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        user_id=user_id,
        priority_board_id=task.priority_board_id,
        position=max_position,
        
        # Reminder fields
        reminder_enabled=task.reminder_enabled,
        reminder_time=reminder_time,
        reminder_type=task.reminder_type,
        reminder_sent=False,
        
        # Recurring fields
        is_recurring=task.is_recurring,
        recurring_pattern=task.recurring_pattern,
        recurring_config=task.recurring_config,
        parent_task_id=None,  # Will be set for child tasks
        next_occurrence=next_occurrence
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int, user_id: str) -> Optional[Task]:
    return db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == user_id)
    ).first()

def get_tasks_by_priority_board(db: Session, priority_board_id: int, user_id: str) -> List[Task]:
    return db.query(Task).filter(
        and_(Task.priority_board_id == priority_board_id, Task.user_id == user_id)
    ).order_by(Task.position).all()

def get_tasks_by_user(db: Session, user_id: str) -> List[Task]:
    return db.query(Task).filter(Task.user_id == user_id).order_by(Task.priority_board_id, Task.position).all()

def update_task(db: Session, task_id: int, task: TaskUpdate, user_id: str) -> Optional[Task]:
    db_task = get_task(db, task_id, user_id)
    if db_task:
        update_data = task.dict(exclude_unset=True)
        
        # Handle reminder time calculation
        if 'reminder_enabled' in update_data or 'due_date' in update_data:
            if update_data.get('reminder_enabled', db_task.reminder_enabled) and update_data.get('due_date', db_task.due_date):
                reminder_time = calculate_reminder_time(
                    update_data.get('due_date', db_task.due_date), 
                    15  # Default 15 minutes advance
                )
                update_data['reminder_time'] = reminder_time
        
        # Handle recurring task next occurrence calculation
        if 'is_recurring' in update_data or 'recurring_config' in update_data or 'due_date' in update_data:
            if update_data.get('is_recurring', db_task.is_recurring) and update_data.get('recurring_config', db_task.recurring_config):
                config = RecurringConfig(**(update_data.get('recurring_config', db_task.recurring_config) or {}))
                next_occurrence = calculate_next_occurrence(
                    update_data.get('due_date', db_task.due_date) or datetime.utcnow(),
                    update_data.get('recurring_pattern', db_task.recurring_pattern),
                    config
                )
                update_data['next_occurrence'] = next_occurrence
        
        for field, value in update_data.items():
            setattr(db_task, field, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: str) -> bool:
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

def reorder_task(db: Session, task_id: int, new_position: int, new_priority_board_id: Optional[int], user_id: str) -> Optional[Task]:
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    old_position = db_task.position
    old_priority_board_id = db_task.priority_board_id
    
    # Update the task's position and priority board
    db_task.position = new_position
    if new_priority_board_id:
        db_task.priority_board_id = new_priority_board_id
    
    # Reorder other tasks in the affected priority boards
    if new_priority_board_id and new_priority_board_id != old_priority_board_id:
        # Move task to new priority board
        # Shift positions in old priority board
        db.query(Task).filter(
            and_(
                Task.priority_board_id == old_priority_board_id,
                Task.position > old_position,
                Task.user_id == user_id
            )
        ).update({Task.position: Task.position - 1})
        
        # Shift positions in new priority board
        db.query(Task).filter(
            and_(
                Task.priority_board_id == new_priority_board_id,
                Task.position >= new_position,
                Task.user_id == user_id
            )
        ).update({Task.position: Task.position + 1})
    else:
        # Reorder within same priority board
        if new_position > old_position:
            db.query(Task).filter(
                and_(
                    Task.priority_board_id == old_priority_board_id,
                    Task.position > old_position,
                    Task.position <= new_position,
                    Task.user_id == user_id
                )
            ).update({Task.position: Task.position - 1})
        else:
            db.query(Task).filter(
                and_(
                    Task.priority_board_id == old_priority_board_id,
                    Task.position >= new_position,
                    Task.position < old_position,
                    Task.user_id == user_id
                )
            ).update({Task.position: Task.position + 1})
    
    db.commit()
    db.refresh(db_task)
    return db_task

def bulk_update_tasks(db: Session, task_ids: List[int], updates: TaskUpdate, user_id: str) -> int:
    # Verify all tasks belong to the user
    tasks = db.query(Task).filter(
        and_(Task.id.in_(task_ids), Task.user_id == user_id)
    ).all()
    
    if len(tasks) != len(task_ids):
        return 0  # Some tasks don't belong to user
    
    update_data = updates.dict(exclude_unset=True)
    updated_count = 0
    
    for task in tasks:
        for field, value in update_data.items():
            setattr(task, field, value)
        updated_count += 1
    
    db.commit()
    return updated_count

# Date filtering functions for Daily and Weekly views
def get_tasks_by_date(db: Session, user_id: str, target_date) -> List[Task]:
    """Get all tasks for a specific date"""
    from datetime import datetime
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = datetime.combine(target_date, datetime.max.time())
    
    return db.query(Task).filter(
        and_(
            Task.user_id == user_id,
            Task.due_date >= start_of_day,
            Task.due_date <= end_of_day
        )
    ).order_by(Task.priority_board_id, Task.position).all()

def get_tasks_by_date_range(db: Session, user_id: str, start_date, end_date) -> List[Task]:
    """Get all tasks within a date range"""
    from datetime import datetime
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    return db.query(Task).filter(
        and_(
            Task.user_id == user_id,
            Task.due_date >= start_datetime,
            Task.due_date <= end_datetime
        )
    ).order_by(Task.due_date, Task.priority_board_id, Task.position).all()

# New functions for recurring tasks and reminders
def create_recurring_task(db: Session, task: TaskCreate, recurring_config: RecurringConfig, user_id: str) -> Task:
    """
    Create a recurring task with the specified configuration
    """
    # Set the recurring fields
    task.is_recurring = True
    task.recurring_pattern = RecurringPattern.CUSTOM  # Will be determined by config
    task.recurring_config = recurring_config.dict()
    
    # Create the initial task
    db_task = create_task(db, task, user_id)
    
    # Set this task as the parent for future occurrences
    db_task.parent_task_id = db_task.id
    db.commit()
    db.refresh(db_task)
    
    return db_task

def get_recurring_tasks(db: Session, user_id: str) -> List[Task]:
    """
    Get all recurring tasks for a user
    """
    return db.query(Task).filter(
        and_(Task.user_id == user_id, Task.is_recurring == True)
    ).order_by(Task.due_date).all()

def get_tasks_with_reminders(db: Session, user_id: str) -> List[Task]:
    """
    Get all tasks with reminders for a user
    """
    return db.query(Task).filter(
        and_(Task.user_id == user_id, Task.reminder_enabled == True)
    ).order_by(Task.reminder_time).all()

def get_pending_reminders(db: Session, user_id: str) -> List[Task]:
    """
    Get tasks with pending reminders (reminder time has passed but not sent)
    """
    return db.query(Task).filter(
        and_(
            Task.user_id == user_id,
            Task.reminder_enabled == True,
            Task.reminder_time <= datetime.utcnow(),
            Task.reminder_sent == False
        )
    ).all()

def mark_reminder_sent(db: Session, task_id: int, user_id: str) -> bool:
    """
    Mark a reminder as sent
    """
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db_task.reminder_sent = True
        db.commit()
        return True
    return False

def process_recurring_tasks(db: Session, user_id: str) -> List[Task]:
    """
    Process recurring tasks and create next occurrences where needed
    """
    try:
        from recurring_utils import should_create_next_occurrence, get_recurring_tasks_due_soon, create_next_occurrence
        
        # Get recurring tasks that need next occurrences
        tasks_to_process = get_recurring_tasks_due_soon(db, user_id)
        created_tasks = []
        
        print(f"Processing {len(tasks_to_process)} recurring tasks for user {user_id}")
        
        for task in tasks_to_process:
            try:
                if should_create_next_occurrence(task):
                    new_task = create_next_occurrence(task, db)
                    if new_task:
                        db.add(new_task)
                        created_tasks.append(new_task)
                        print(f"Created new occurrence for task {task.id}: {task.title}")
            except Exception as e:
                print(f"Error processing recurring task {task.id}: {str(e)}")
                continue
        
        if created_tasks:
            db.commit()
            for task in created_tasks:
                db.refresh(task)
            print(f"Successfully created {len(created_tasks)} new task occurrences")
        
        return created_tasks
        
    except Exception as e:
        print(f"Error in process_recurring_tasks: {str(e)}")
        db.rollback()
        raise e

def get_task_occurrences(db: Session, parent_task_id: int, user_id: str) -> List[Task]:
    """
    Get all occurrences of a recurring task
    """
    return db.query(Task).filter(
        and_(
            Task.user_id == user_id,
            Task.parent_task_id == parent_task_id
        )
    ).order_by(Task.due_date).all()
