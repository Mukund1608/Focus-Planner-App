from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from typing import List
from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session

from database import get_db
from crud import (
    create_priority_board, get_priority_board, get_priority_boards,
    update_priority_board, delete_priority_board,
    create_task, get_task, get_tasks_by_priority_board, get_tasks_by_user,
    update_task, delete_task, reorder_task, bulk_update_tasks
)
from schemas import (
    PriorityBoardCreate, PriorityBoardResponse, PriorityBoardUpdate,
    TaskCreate, TaskResponse, TaskUpdate, TaskReorderRequest, TaskBulkUpdateRequest
)

router = APIRouter(prefix="/api", tags=["tasks"])

# Dependency to get current user from SuperTokens session
async def get_current_user(session: SessionContainer = Depends(verify_session())) -> str:
    return session.get_user_id()

# Priority Board endpoints
@router.post("/priority-boards", response_model=PriorityBoardResponse)
async def create_priority_board_endpoint(
    priority_board: PriorityBoardCreate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Create a new priority board for the current user"""
    return create_priority_board(db, priority_board, current_user)

@router.get("/priority-boards", response_model=List[PriorityBoardResponse])
async def get_priority_boards_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all priority boards for the current user"""
    return get_priority_boards(db, current_user)

@router.get("/priority-boards/{priority_board_id}", response_model=PriorityBoardResponse)
async def get_priority_board_endpoint(
    priority_board_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get a specific priority board by ID"""
    priority_board = get_priority_board(db, priority_board_id, current_user)
    if not priority_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Priority board not found"
        )
    return priority_board

@router.put("/priority-boards/{priority_board_id}", response_model=PriorityBoardResponse)
async def update_priority_board_endpoint(
    priority_board_id: int,
    priority_board: PriorityBoardUpdate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Update a priority board"""
    updated_board = update_priority_board(db, priority_board_id, priority_board, current_user)
    if not updated_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Priority board not found"
        )
    return updated_board

@router.delete("/priority-boards/{priority_board_id}")
async def delete_priority_board_endpoint(
    priority_board_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Delete a priority board"""
    success = delete_priority_board(db, priority_board_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Priority board not found"
        )
    return {"message": "Priority board deleted successfully"}

# Task endpoints
@router.post("/tasks", response_model=TaskResponse)
async def create_task_endpoint(
    task: TaskCreate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Create a new task"""
    return create_task(db, task, current_user)

@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all tasks for the current user"""
    return get_tasks_by_user(db, current_user)

@router.get("/tasks/priority-board/{priority_board_id}", response_model=List[TaskResponse])
async def get_tasks_by_priority_board_endpoint(
    priority_board_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all tasks for a specific priority board"""
    return get_tasks_by_priority_board(db, priority_board_id, current_user)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task_endpoint(
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get a specific task by ID"""
    task = get_task(db, task_id, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(
    task_id: int,
    task: TaskUpdate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Update a task"""
    updated_task = update_task(db, task_id, task, current_user)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return updated_task

@router.delete("/tasks/{task_id}")
async def delete_task_endpoint(
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Delete a task"""
    success = delete_task(db, task_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Task deleted successfully"}

@router.post("/tasks/{task_id}/reorder")
async def reorder_task_endpoint(
    task_id: int,
    reorder_request: TaskReorderRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Reorder a task within or between priority boards"""
    updated_task = reorder_task(
        db, 
        task_id, 
        reorder_request.new_position, 
        reorder_request.new_priority_board_id, 
        current_user
    )
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Task reordered successfully", "task": updated_task}

@router.post("/tasks/bulk-update")
async def bulk_update_tasks_endpoint(
    bulk_update: TaskBulkUpdateRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Bulk update multiple tasks"""
    updated_count = bulk_update_tasks(db, bulk_update.task_ids, bulk_update.updates, current_user)
    return {"message": f"Updated {updated_count} tasks successfully"}
