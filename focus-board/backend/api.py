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
    update_task, delete_task, reorder_task, bulk_update_tasks,
    get_tasks_by_date, get_tasks_by_date_range,
    create_recurring_task, get_recurring_tasks, get_tasks_with_reminders,
    get_pending_reminders, mark_reminder_sent, process_recurring_tasks,
    get_task_occurrences,
    create_habit, get_habit, get_habits, update_habit, delete_habit,
    complete_habit, get_habit_completions, get_habit_stats
)
from schemas import (
    PriorityBoardCreate, PriorityBoardResponse, PriorityBoardUpdate,
    TaskCreate, TaskResponse, TaskUpdate, TaskReorderRequest, TaskBulkUpdateRequest,
    CreateRecurringTaskRequest, RecurringConfig, ReminderConfig,
    HabitCreate, HabitResponse, HabitUpdate, HabitCompletionCreate,
    HabitCompletionResponse, HabitStats
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

@router.get("/tasks/by-date/{date}", response_model=List[TaskResponse])
async def get_tasks_by_date_endpoint(
    date: str,  # Format: YYYY-MM-DD
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all tasks for a specific date for the current user"""
    from datetime import datetime
    try:
        # Parse the date string
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        return get_tasks_by_date(db, current_user, target_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

@router.get("/tasks/by-week/{start_date}", response_model=List[TaskResponse])
async def get_tasks_by_week_endpoint(
    start_date: str,  # Format: YYYY-MM-DD (start of week)
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all tasks for a specific week (7 days starting from start_date)"""
    from datetime import datetime, timedelta
    try:
        # Parse the start date
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = start + timedelta(days=6)  # 7 days total
        return get_tasks_by_date_range(db, current_user, start, end)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

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

# New endpoints for recurring tasks and reminders

@router.post("/tasks/recurring", response_model=TaskResponse)
async def create_recurring_task_endpoint(
    request: CreateRecurringTaskRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Create a new recurring task"""
    return create_recurring_task(db, request.base_task, request.recurring_config, current_user)

@router.get("/tasks/recurring", response_model=List[TaskResponse])
async def get_recurring_tasks_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all recurring tasks for the current user"""
    return get_recurring_tasks(db, current_user)

@router.get("/tasks/recurring/{parent_task_id}/occurrences", response_model=List[TaskResponse])
async def get_task_occurrences_endpoint(
    parent_task_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all occurrences of a recurring task"""
    return get_task_occurrences(db, parent_task_id, current_user)

@router.post("/tasks/recurring/process")
async def process_recurring_tasks_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Process recurring tasks and create next occurrences where needed"""
    try:
        created_tasks = process_recurring_tasks(db, current_user)
        return {
            "message": f"Processed recurring tasks. Created {len(created_tasks)} new occurrences",
            "created_tasks": [TaskResponse.from_orm(task) for task in created_tasks]
        }
    except Exception as e:
        print(f"Error in process_recurring_tasks_endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process recurring tasks: {str(e)}"
        )

@router.get("/tasks/reminders", response_model=List[TaskResponse])
async def get_tasks_with_reminders_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all tasks with reminders for the current user"""
    return get_tasks_with_reminders(db, current_user)

@router.get("/tasks/reminders/pending", response_model=List[TaskResponse])
async def get_pending_reminders_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get tasks with pending reminders (reminder time has passed but not sent)"""
    return get_pending_reminders(db, current_user)

@router.post("/tasks/{task_id}/reminder/sent")
async def mark_reminder_sent_endpoint(
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Mark a reminder as sent"""
    success = mark_reminder_sent(db, task_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Reminder marked as sent"}

@router.post("/tasks/{task_id}/reminder/configure")
async def configure_task_reminder_endpoint(
    task_id: int,
    reminder_config: ReminderConfig,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Configure reminder settings for a task"""
    from recurring_utils import calculate_reminder_time
    
    task = get_task(db, task_id, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update reminder settings
    task.reminder_enabled = reminder_config.enabled
    task.reminder_type = reminder_config.type
    
    if reminder_config.enabled and task.due_date:
        task.reminder_time = calculate_reminder_time(task.due_date, reminder_config.advance_minutes)
    else:
        task.reminder_time = None
    
    task.reminder_sent = False
    db.commit()
    db.refresh(task)
    
    return {"message": "Reminder configured successfully", "task": TaskResponse.from_orm(task)}

# Habit endpoints
@router.post("/habits", response_model=HabitResponse)
async def create_habit_endpoint(
    habit: HabitCreate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Create a new habit for the current user"""
    return create_habit(db, habit, current_user)

@router.get("/habits", response_model=List[HabitResponse])
async def get_habits_endpoint(
    active_only: bool = False,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get all habits for the current user, optionally filtered by active status"""
    return get_habits(db, current_user, active_only)

@router.get("/habits/{habit_id}", response_model=HabitResponse)
async def get_habit_endpoint(
    habit_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get a specific habit by ID"""
    habit = get_habit(db, habit_id, current_user)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit

@router.put("/habits/{habit_id}", response_model=HabitResponse)
async def update_habit_endpoint(
    habit_id: int,
    habit: HabitUpdate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Update a habit"""
    updated_habit = update_habit(db, habit_id, habit, current_user)
    if not updated_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return updated_habit

@router.delete("/habits/{habit_id}")
async def delete_habit_endpoint(
    habit_id: int,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Delete a habit"""
    success = delete_habit(db, habit_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return {"message": "Habit deleted successfully"}

@router.post("/habits/{habit_id}/complete", response_model=HabitCompletionResponse)
async def complete_habit_endpoint(
    habit_id: int,
    completion: HabitCompletionCreate,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Mark a habit as completed for today"""
    completion_record = complete_habit(db, habit_id, completion, current_user)
    if not completion_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return completion_record

@router.get("/habits/{habit_id}/completions", response_model=List[HabitCompletionResponse])
async def get_habit_completions_endpoint(
    habit_id: int,
    days: int = 30,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get habit completions for the last N days"""
    # Verify the habit belongs to the user
    habit = get_habit(db, habit_id, current_user)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return get_habit_completions(db, habit_id, current_user, days)

@router.get("/habits/stats", response_model=HabitStats)
async def get_habit_stats_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get comprehensive habit statistics for the current user"""
    return get_habit_stats(db, current_user)

# Exam Mode API Endpoints
from schemas import (
    ExamScheduleGenerateRequest, ExamScheduleResponse, ExamScheduleGetResponse,
    ExamTaskCompletionRequest, NotificationPreferencesRequest, NotificationPreferencesResponse
)
from crud import (
    create_exam_schedule, get_active_exam_schedule, get_exam_schedule_by_day,
    update_exam_task_completion, get_notification_preferences, update_notification_preferences
)
from exam_scheduler import ExamScheduler

@router.post("/schedule/generate", response_model=ExamScheduleResponse)
async def generate_exam_schedule_endpoint(
    request: ExamScheduleGenerateRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Generate or regenerate an exam schedule"""
    
    # Initialize scheduler with config
    config = {
        'blockMinutes': request.blockMinutes or 50,
        'shortBreakMinutes': request.shortBreakMinutes or 10,
        'longBreakMinutes': request.longBreakMinutes or 20,
        'longBreakEveryNBlocks': request.longBreakEveryNBlocks or 3,
        'reserveRevision': request.reserveRevision if request.reserveRevision is not None else True
    }
    scheduler = ExamScheduler(config)
    
    # Validate inputs
    # Convert Pydantic models to dict format for validation
    subjects_data = []
    for subject in request.subjects:
        subjects_data.append({
            'id': subject.id,
            'name': subject.name,
            'examDate': subject.examDate,
            'difficulty': subject.difficulty.value.upper(),
            'weightOverride': subject.weightOverride if subject.weightOverride is not None else 1.0
        })
    
    is_valid, errors = scheduler.validate_inputs(subjects_data, request.dailyHours)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Invalid inputs", "errors": errors}
        )
    
    # Generate schedule
    try:
        # Convert Pydantic models to dict format for the scheduler
        subjects_data = []
        for subject in request.subjects:
                    subjects_data.append({
            'id': subject.id,
            'name': subject.name,
            'examDate': subject.examDate,
            'difficulty': subject.difficulty.value.upper(),
            'weightOverride': subject.weightOverride if subject.weightOverride is not None else 1.0
        })
        
        schedule_data = scheduler.generate_schedule(
            subjects=subjects_data,
            daily_hours=request.dailyHours,
            start_date=request.startDate
        )
        
        # Store in database
        schedule = create_exam_schedule(db, current_user, schedule_data)
        
        # Return response
        return {
            "scheduleId": schedule.id,
            "version": schedule.version,
            "fromDate": schedule.from_date.isoformat(),
            "toDate": schedule.to_date.isoformat(),
            "days": schedule_data['days']
        }
        
    except Exception as e:
        import traceback
        print(f"Error generating schedule: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate schedule: {str(e)}"
        )

@router.get("/schedule/get", response_model=ExamScheduleGetResponse)
async def get_exam_schedule_endpoint(
    day: str = None,  # Optional: YYYY-MM-DD format
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get active exam schedule, optionally filtered by day"""
    
    if day:
        # Get tasks for specific day
        try:
            tasks = get_exam_schedule_by_day(db, current_user, day)
            return {
                "day": day,
                "tasks": [
                    {
                        "id": task.id,
                        "subjectId": task.subject_id,
                        "subjectName": task.subject_name,
                        "difficulty": task.difficulty.value,
                        "plannedMinutes": task.planned_minutes,
                        "pomodoroBlocks": task.pomodoro_blocks,
                        "completedAt": task.completed_at.isoformat() if task.completed_at else None,
                        "notes": task.notes
                    }
                    for task in tasks
                ]
            }
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    else:
        # Get full schedule
        schedule = get_active_exam_schedule(db, current_user)
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active exam schedule found"
            )
        
        # Convert to response format
        days = []
        for schedule_day in schedule.days:
            day_tasks = [
                {
                    "id": task.id,
                    "subjectId": task.subject_id,
                    "subjectName": task.subject_name,
                    "difficulty": task.difficulty.value,
                    "plannedMinutes": task.planned_minutes,
                    "pomodoroBlocks": task.pomodoro_blocks,
                    "completedAt": task.completed_at.isoformat() if task.completed_at else None,
                    "notes": task.notes
                }
                for task in schedule_day.tasks
            ]
            
            days.append({
                "day": schedule_day.day.isoformat(),
                "totalPlannedMinutes": schedule_day.total_planned_minutes,
                "tasks": day_tasks
            })
        
        return {
            "schedule": {
                "scheduleId": schedule.id,
                "version": schedule.version,
                "fromDate": schedule.from_date.isoformat(),
                "toDate": schedule.to_date.isoformat(),
                "days": days
            }
        }

@router.post("/schedule/complete-task")
async def complete_exam_task_endpoint(
    request: ExamTaskCompletionRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Toggle completion status for an exam task"""
    
    try:
        task = update_exam_task_completion(db, current_user, request.taskId, request.completed)
        return {
            "message": "Task updated successfully",
            "taskId": task.id,
            "completed": task.completed_at is not None
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

@router.delete("/schedule/delete")
async def delete_exam_schedule_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Delete the active exam schedule for the current user"""
    
    try:
        # Get active schedule
        schedule = get_active_exam_schedule(db, current_user)
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active exam schedule found"
            )
        
        # Delete the schedule (this will cascade to days and tasks)
        db.delete(schedule)
        db.commit()
        
        return {"message": "Exam schedule deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete schedule: {str(e)}"
        )

@router.get("/schedule/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences_endpoint(
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Get notification preferences for the current user"""
    prefs = get_notification_preferences(db, current_user)
    return {
        "amEnabled": prefs.am_enabled,
        "amTime": prefs.am_time,
        "pmEnabled": prefs.pm_enabled,
        "pmTime": prefs.pm_time,
        "tz": prefs.tz
    }

@router.put("/schedule/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences_endpoint(
    request: NotificationPreferencesRequest,
    current_user: str = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Update notification preferences for the current user"""
    prefs = update_notification_preferences(db, current_user, request.dict(exclude_unset=True))
    return {
        "amEnabled": prefs.am_enabled,
        "amTime": prefs.am_time,
        "pmEnabled": prefs.pm_enabled,
        "pmTime": prefs.pm_time,
        "tz": prefs.tz
    }
