import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, PriorityLevel, TaskCreate, TaskUpdate } from '../types/task';
import TaskForm from './TaskForm';
import './PriorityBoards.css';

const PriorityBoards: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');

  // Priority helper functions
  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return '#EF4444'; // danger
      case PriorityLevel.HIGH:
        return '#6D7BFF'; // blue-accent
      case PriorityLevel.MEDIUM:
        return '#8B5CF6'; // purple
      case PriorityLevel.LOW:
        return '#22C55E'; // success
      default:
        return '#6B7280'; // gray
    }
  };

  const getPriorityLabel = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return 'Boss Task';
      case PriorityLevel.HIGH:
        return 'Milestone';
      case PriorityLevel.MEDIUM:
        return 'Weekly Streak';
      case PriorityLevel.LOW:
        return 'Daily';
      default:
        return 'Quest';
    }
  };

  const getPriorityIcon = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return '👑';
      case PriorityLevel.HIGH:
        return '🏆';
      case PriorityLevel.MEDIUM:
        return '⚡';
      case PriorityLevel.LOW:
        return '📋';
      default:
        return '🎯';
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load tasks from API
        const response = await fetch('/api/tasks');
        const tasksData = await response.json();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load tasks');
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
      if (editingTask) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId: number, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Filter tasks by priority
  const filteredTasks = priorityFilter === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.priority === priorityFilter);

  // Group tasks by priority
  const groupedTasks = {
    [PriorityLevel.URGENT]: filteredTasks.filter(task => task.priority === PriorityLevel.URGENT),
    [PriorityLevel.HIGH]: filteredTasks.filter(task => task.priority === PriorityLevel.HIGH),
    [PriorityLevel.MEDIUM]: filteredTasks.filter(task => task.priority === PriorityLevel.MEDIUM),
    [PriorityLevel.LOW]: filteredTasks.filter(task => task.priority === PriorityLevel.LOW),
  };

  // Calculate stats
  const calculateStats = () => {
    return {
      total: tasks.length,
      urgent: tasks.filter(task => task.priority === PriorityLevel.URGENT).length,
      high: tasks.filter(task => task.priority === PriorityLevel.HIGH).length,
      medium: tasks.filter(task => task.priority === PriorityLevel.MEDIUM).length,
      low: tasks.filter(task => task.priority === PriorityLevel.LOW).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="priority-boards">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading priority board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="priority-boards">
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
    <div className="priority-boards">
      {/* Header */}
      <div className="boards-header">
        <div>
          <h2 className="text-h1">Priority Board</h2>
          <p className="text-body-lg">Organize tasks by priority level</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
        >
          + Add Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="weekly-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <div className="stat-number">{stats.urgent}</div>
              <div className="stat-label">Boss Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{stats.high}</div>
              <div className="stat-label">Milestones</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="priority-filter">
        <h3 className="text-h2">Filter by Priority</h3>
        <div className="priority-buttons">
          <button
            className={`priority-btn ${priorityFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('ALL')}
          >
            All Tasks ({stats.total})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.URGENT ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.URGENT)}
          >
            {getPriorityIcon(PriorityLevel.URGENT)} Boss Tasks ({stats.urgent})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.HIGH ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.HIGH)}
          >
            {getPriorityIcon(PriorityLevel.HIGH)} Milestones ({stats.high})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.MEDIUM ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.MEDIUM)}
          >
            {getPriorityIcon(PriorityLevel.MEDIUM)} Weekly Streaks ({stats.medium})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.LOW ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.LOW)}
          >
            {getPriorityIcon(PriorityLevel.LOW)} Daily ({stats.low})
          </button>
        </div>
      </div>

      {/* Priority Sections */}
      <div className="priority-sections">
        {priorityFilter === 'ALL' ? (
          // Show all priorities grouped
          Object.entries(groupedTasks).map(([priority, priorityTasks]) => (
            priorityTasks.length > 0 && (
              <div key={priority} className="priority-section">
                <div className="section-header">
                  <h3 className="text-h2">
                    {getPriorityIcon(priority as PriorityLevel)} {getPriorityLabel(priority as PriorityLevel)}
                  </h3>
                  <div className="task-count">{priorityTasks.length} tasks</div>
                </div>
                <div className="tasks-grid">
                  {priorityTasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <div 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        ></div>
                        <h4>{task.title}</h4>
                      </div>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className="task-due-date">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <span className={`task-status ${task.status}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="task-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => handleTaskStatusUpdate(task.id, TaskStatus.COMPLETED)}
                          disabled={task.status === TaskStatus.COMPLETED}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        ) : (
          // Show filtered tasks
          <div className="priority-section">
            <div className="section-header">
              <h3 className="text-h2">
                {getPriorityIcon(priorityFilter)} {getPriorityLabel(priorityFilter)}
              </h3>
              <div className="task-count">{filteredTasks.length} tasks</div>
            </div>
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    ></div>
                    <h4>{task.title}</h4>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-due-date">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                    <span className={`task-status ${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleTaskStatusUpdate(task.id, TaskStatus.COMPLETED)}
                      disabled={task.status === TaskStatus.COMPLETED}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-illustration">
            <div className="empty-icon">🎯</div>
          </div>
          <h4>No tasks found</h4>
          <p>
            {priorityFilter === 'ALL' 
              ? "You don't have any tasks yet. Create your first task to get started!"
              : `No ${getPriorityLabel(priorityFilter).toLowerCase()} tasks found.`
            }
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
          >
            Create Your First Task
          </button>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default PriorityBoards;
