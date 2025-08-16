import React, { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { Task, TaskStatus } from '../types/task';
import { taskAPI } from '../services/api';
import TaskCard from './TaskCard';
import './WeeklyView.css';

const WeeklyView: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate week days (Monday to Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeek, i));

  // Load tasks for the selected week
  useEffect(() => {
    loadTasksForWeek();
  }, [selectedWeek]);

  const loadTasksForWeek = async () => {
    try {
      setLoading(true);
      const startDateString = format(selectedWeek, 'yyyy-MM-dd');
      const tasksForWeek = await taskAPI.getByWeek(startDateString);
      setTasks(tasksForWeek);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks for this week');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskAPI.update(taskId, updates);
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleTaskStatusChange = (taskId: number, status: TaskStatus) => {
    handleTaskUpdate(taskId, { status });
  };

  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  // Calculate weekly progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
  const progressPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  if (loading) {
    return (
      <div className="weekly-view-container">
        <div className="loading">
          Loading tasks for week of {format(selectedWeek, 'MMMM d, yyyy')}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadTasksForWeek} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-view-container">
      {/* Header with week navigation */}
      <div className="weekly-view-header">
        <div className="week-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateWeek('prev')}
            title="Previous week"
          >
            ←
          </button>
          
          <div className="current-week">
            <h1 className="week-title">
              Week of {format(selectedWeek, 'MMMM d, yyyy')}
            </h1>
            <div className="week-range">
              {format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d, yyyy')}
            </div>
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => navigateWeek('next')}
            title="Next week"
          >
            →
          </button>
        </div>

        {/* Weekly progress summary */}
        <div className="progress-summary">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completedTasks.length} of {totalTasks} tasks completed this week
            {totalTasks > 0 && ` (${Math.round(progressPercentage)}%)`}
          </div>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="weekly-grid">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const dayCompletedTasks = dayTasks.filter(task => task.status === TaskStatus.COMPLETED);
          const dayProgress = dayTasks.length > 0 ? (dayCompletedTasks.length / dayTasks.length) * 100 : 0;

          return (
            <div 
              key={index} 
              className={`day-column ${isToday(day) ? 'today' : ''}`}
            >
              <div className="day-header">
                <div className="day-name">
                  {format(day, 'EEE')}
                </div>
                <div className="day-date">
                  {format(day, 'd')}
                </div>
                {isToday(day) && <div className="today-indicator">Today</div>}
              </div>

              <div className="day-progress">
                <div className="day-progress-bar">
                  <div 
                    className="day-progress-fill" 
                    style={{ width: `${dayProgress}%` }}
                  ></div>
                </div>
                <div className="day-task-count">
                  {dayCompletedTasks.length}/{dayTasks.length}
                </div>
              </div>

              <div className="day-tasks">
                {dayTasks.length === 0 ? (
                  <div className="empty-day">
                    <span>No tasks</span>
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}} // TODO: Implement edit
                      onDelete={() => handleTaskDelete(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state for entire week */}
      {totalTasks === 0 && (
        <div className="empty-state">
          <h2>No tasks for this week</h2>
          <p>Create some tasks to start planning your week!</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
