import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, PriorityLevel, TaskCreate, TaskUpdate } from '../types/task';
import { taskAPI } from '../services/api';
import TaskForm from './TaskForm';
import './PriorityBoards.css';
import './TaskCard.css';

const PriorityBoards: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
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
        return 'Urgent';
      case PriorityLevel.HIGH:
        return 'High';
      case PriorityLevel.MEDIUM:
        return 'Medium';
      case PriorityLevel.LOW:
        return 'Low';
      default:
        return 'Quest';
    }
  };

  const getPriorityIcon = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return '🚨';
      case PriorityLevel.HIGH:
        return '🔥';
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
        // Load tasks from API using proper service
        const tasksData = await taskAPI.getAll();
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
        const updatedTask = await taskAPI.update(editingTask.id, taskData as TaskUpdate);
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      } else {
        // Create new task
        const newTask = await taskAPI.create(taskData as TaskCreate);
        setTasks([...tasks, newTask]);
      }
      setShowTaskForm(false);
      setEditingTask(undefined);
    } catch (err) {
      console.error('Error saving task:', err);
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

  // Handle task deletion
  const handleTaskDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Failed to delete task. Please try again.');
      }
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
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
      urgent: tasks.filter(task => task.priority === PriorityLevel.URGENT).length,
      high: tasks.filter(task => task.priority === PriorityLevel.HIGH).length,
      medium: tasks.filter(task => task.priority === PriorityLevel.MEDIUM).length,
      low: tasks.filter(task => task.priority === PriorityLevel.LOW).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
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
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(undefined);
            setShowTaskForm(true);
          }}
        >
          + Add Task
        </button>
      </div>

      {/* Priority Filter */}
      <div className="priority-filter">
        <h3 className="text-h2">Filter by Priority</h3>
        <div className="priority-buttons">
          <button
            className={`priority-btn ${priorityFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('ALL')}
          >
            All ({stats.total})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.URGENT ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.URGENT)}
          >
            {getPriorityIcon(PriorityLevel.URGENT)} Urgent ({stats.urgent})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.HIGH ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.HIGH)}
          >
            {getPriorityIcon(PriorityLevel.HIGH)} High ({stats.high})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.MEDIUM ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.MEDIUM)}
          >
            {getPriorityIcon(PriorityLevel.MEDIUM)} Medium ({stats.medium})
          </button>
          <button
            className={`priority-btn ${priorityFilter === PriorityLevel.LOW ? 'active' : ''}`}
            onClick={() => setPriorityFilter(PriorityLevel.LOW)}
          >
            {getPriorityIcon(PriorityLevel.LOW)} Low ({stats.low})
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
                    <div key={task.id} className={`quest-card ${task.status === TaskStatus.IN_PROGRESS ? 'active' : ''} ${task.status === TaskStatus.COMPLETED ? 'completed' : ''}`}>
                      {/* Quest Leader Stripe */}
                      <div 
                        className="quest-leader-stripe"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      />
                      
                      <div className="quest-content">
                        <div className="quest-header">
                          <div className="quest-title-section">
                            <h4 className="quest-title">{task.title}</h4>
                          </div>
                        </div>
                        
                        <p className="quest-description">{task.description}</p>
                        
                        <div className="quest-meta">
                          <div className="quest-tags">
                            <span className="quest-due-date">
                              📅 Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                            </span>
                            <span className={`quest-status ${task.status}`}>
                              {task.status === TaskStatus.COMPLETED ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🔄' : '⏳'} {task.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="quest-actions">
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
                          <button
                            className="btn-danger"
                            onClick={() => handleTaskDelete(task.id)}
                            title="Delete task"
                          >
                            🗑️ Delete
                          </button>
                        </div>
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
                <div key={task.id} className={`quest-card ${task.status === TaskStatus.IN_PROGRESS ? 'active' : ''} ${task.status === TaskStatus.COMPLETED ? 'completed' : ''}`}>
                  {/* Quest Leader Stripe */}
                  <div 
                    className="quest-leader-stripe"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  
                  <div className="quest-content">
                                         <div className="quest-header">
                       <div className="quest-title-section">
                         <h4 className="quest-title">{task.title}</h4>
                       </div>
                     </div>
                    
                    <p className="quest-description">{task.description}</p>
                    
                    <div className="quest-meta">
                      <div className="quest-tags">
                        <span className="quest-due-date">
                          📅 Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                        <span className={`quest-status ${task.status}`}>
                          {task.status === TaskStatus.COMPLETED ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🔄' : '⏳'} {task.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="quest-actions">
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
                      <button
                        className="btn-danger"
                        onClick={() => handleTaskDelete(task.id)}
                        title="Delete task"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
           <h4>No tasks found</h4>
         </div>
       )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
};

export default PriorityBoards;
