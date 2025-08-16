from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from models import Task, PriorityBoard, User, PriorityLevel, TaskStatus
from schemas import TaskCreate, TaskUpdate, PriorityBoardCreate, PriorityBoardUpdate

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
    
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        user_id=user_id,
        priority_board_id=task.priority_board_id,
        position=max_position
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
