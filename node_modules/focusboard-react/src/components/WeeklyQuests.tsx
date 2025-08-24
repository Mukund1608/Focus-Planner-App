import React, { useState, useEffect } from 'react';
import { PriorityBoard, Task, TaskStatus, PriorityLevel, ReminderType, RecurringPattern, TaskCreate, TaskUpdate } from '../types/task';
import { taskAPI, priorityBoardAPI } from '../services/api';
import TaskForm from './TaskForm';
import './WeeklyQuests.css';

const WeeklyQuests: React.FC = () => {
  const [boards, setBoards] = useState<PriorityBoard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current week's start and end dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(selectedDate);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get week days
  const getWeekDays = () => {
    const days = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  // Calculate stats
  const calculateStats = () => {
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    return {
      total: weekTasks.length,
      completed: weekTasks.filter(task => task.status === TaskStatus.COMPLETED).length,
      inProgress: weekTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      pending: weekTasks.filter(task => task.status === TaskStatus.PENDING).length,
    };
  };

  const stats = calculateStats();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load boards and tasks from API using proper service
        const boardsData = await priorityBoardAPI.getAll();
        setBoards(boardsData);

        const tasksData = await taskAPI.getAll();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load weekly quests');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle task creation/update
  const handleTaskSubmit = async (taskData: TaskCreate | TaskUpdate) => {
    try {
      console.log('Submitting task data:', taskData);
      
      if (editingTask) {
        // Update existing task
        const updatedTask = await taskAPI.update(editingTask.id, taskData as TaskUpdate);
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      } else {
        // Create new task
        const newTask = await taskAPI.create(taskData as TaskCreate);
        console.log('Task created successfully:', newTask);
        setTasks([...tasks, newTask]);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      // Show error to user
      alert(`Failed to save task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId: number, status: TaskStatus) => {
    try {
      const updatedTask = await taskAPI.update(taskId, { status });
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="weekly-quests">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading weekly quests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-quests">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-quests">
      {/* Header */}
      <div className="weekly-header">
        <h2 className="text-h1">Weekly Quests</h2>
        <p className="text-body-lg">Plan and track your weekly missions</p>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button 
          className="nav-btn" 
          onClick={() => navigateWeek('prev')}
        >
          ←
        </button>
        <div className="week-display">
          <h3 className="text-h2">
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>
        <button 
          className="nav-btn" 
          onClick={() => navigateWeek('next')}
        >
          →
        </button>
      </div>

      

      {/* Weekly Calendar */}
      <div className="weekly-calendar">
        <div className="calendar-header">
          <h3 className="text-h2">Weekly Schedule</h3>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
          >
            + Add Quest
          </button>
        </div>
        <div className="calendar-grid">
          {getWeekDays().map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="day-header">
                  <span className="day-name">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="day-date">
                    {day.getDate()}
                  </span>
                  {isToday && <span className="today-indicator">Today</span>}
                </div>
                <div className="day-tasks">
                  {dayTasks.length === 0 ? (
                    <div className="empty-day">No quests</div>
                  ) : (
                    <div className="task-preview">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="task-preview-item">
                          <span className="task-title">{task.title}</span>
                          <span className={`task-status ${task.status}`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="more-tasks">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
};

export default WeeklyQuests;
