import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { Task, TaskStatus, PriorityLevel } from '../types/task';
import { taskAPI } from '../services/api';
import TaskCard from './TaskCard';
import './DailyView.css';

const DailyView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks for the selected date
  useEffect(() => {
    loadTasksForDate();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasksForDate = async () => {
    try {
      setLoading(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log('Loading tasks for date:', dateString);
      const tasksForDate = await taskAPI.getByDate(dateString);
      console.log('Tasks loaded for date:', tasksForDate);
      setTasks(tasksForDate);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks for this date');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => 
      direction === 'next' ? addDays(prev, 1) : subDays(prev, 1)
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

  const handleTaskStatusChange = async (taskId: number, status: TaskStatus) => {
    try {
      await handleTaskUpdate(taskId, { status });
      // Refresh the tasks after status change
      await loadTasksForDate();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Calculate progress
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // Group tasks by priority
  const tasksByPriority = {
    urgent: tasks.filter(task => task.priority === PriorityLevel.URGENT),
    high: tasks.filter(task => task.priority === PriorityLevel.HIGH),
    medium: tasks.filter(task => task.priority === PriorityLevel.MEDIUM),
    low: tasks.filter(task => task.priority === PriorityLevel.LOW)
  };

  if (loading) {
    return (
      <div className="daily-view-container">
        <div className="loading">Loading tasks for {format(selectedDate, 'MMMM d, yyyy')}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-view-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadTasksForDate} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-view-container">
      {/* Header with date navigation */}
      <div className="daily-view-header">
        <div className="date-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateDate('prev')}
            title="Previous day"
          >
            ←
          </button>
          
          <div className="current-date">
            <h1 className={`date-title ${isToday(selectedDate) ? 'today' : ''}`}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && <span className="today-badge">Today</span>}
            </h1>
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => navigateDate('next')}
            title="Next day"
          >
            →
          </button>
        </div>

        {/* Progress summary */}
        <div className="progress-summary">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completedTasks.length} of {totalTasks} tasks completed
            {totalTasks > 0 && ` (${Math.round(progressPercentage)}%)`}
          </div>
        </div>
      </div>

      {/* Tasks by priority */}
      <div className="tasks-section">
        {totalTasks === 0 ? (
          <div className="empty-state">
            <h2>No tasks for {format(selectedDate, 'MMMM d, yyyy')}</h2>
            <p>Create some tasks to get started with your day!</p>
          </div>
        ) : (
          <div className="priority-sections">
            {/* Urgent Tasks */}
            {tasksByPriority.urgent.length > 0 && (
              <div className="priority-section urgent">
                <h3 className="priority-title urgent">
                  🔴 Urgent ({tasksByPriority.urgent.length})
                </h3>
                <div className="task-list">
                  {tasksByPriority.urgent.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}} // TODO: Implement edit
                      onDelete={() => handleTaskDelete(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Tasks */}
            {tasksByPriority.high.length > 0 && (
              <div className="priority-section high">
                <h3 className="priority-title high">
                  🟠 High ({tasksByPriority.high.length})
                </h3>
                <div className="task-list">
                  {tasksByPriority.high.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}} // TODO: Implement edit
                      onDelete={() => handleTaskDelete(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority Tasks */}
            {tasksByPriority.medium.length > 0 && (
              <div className="priority-section medium">
                <h3 className="priority-title medium">
                  🟡 Medium ({tasksByPriority.medium.length})
                </h3>
                <div className="task-list">
                  {tasksByPriority.medium.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}} // TODO: Implement edit
                      onDelete={() => handleTaskDelete(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority Tasks */}
            {tasksByPriority.low.length > 0 && (
              <div className="priority-section low">
                <h3 className="priority-title low">
                  🟢 Low ({tasksByPriority.low.length})
                </h3>
                <div className="task-list">
                  {tasksByPriority.low.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {}} // TODO: Implement edit
                      onDelete={() => handleTaskDelete(task.id)}
                      onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyView;
