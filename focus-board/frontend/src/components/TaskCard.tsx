import React, { useState } from 'react';
import { Task, PriorityLevel, TaskStatus } from '../types/task';
import { format } from 'date-fns';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return '#dc2626'; // red-600
      case PriorityLevel.HIGH:
        return '#ea580c'; // orange-600
      case PriorityLevel.MEDIUM:
        return '#ca8a04'; // yellow-600
      case PriorityLevel.LOW:
        return '#16a34a'; // green-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '#16a34a'; // green-600
      case TaskStatus.IN_PROGRESS:
        return '#2563eb'; // blue-600
      case TaskStatus.PENDING:
        return '#6b7280'; // gray-500
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: PriorityLevel): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className="task-card" style={{ borderLeftColor: getPriorityColor(task.priority) }}>
      <div className="task-card-header">
        <div className="task-priority">
          <span 
            className="priority-dot" 
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          />
          <span className="priority-label">{getPriorityLabel(task.priority)}</span>
        </div>
        <div className="task-actions">
          <button 
            className="btn-edit" 
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✏️
          </button>
          <button 
            className="btn-delete" 
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h3 className="task-title" onClick={() => setIsExpanded(!isExpanded)}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className={`task-description ${isExpanded ? 'expanded' : ''}`}>
            {task.description}
          </p>
        )}

        <div className="task-meta">
          <div className="task-status">
            <label htmlFor={`status-${task.id}`}>Status:</label>
            <select
              id={`status-${task.id}`}
              value={task.status}
              onChange={handleStatusChange}
              className="status-select"
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {task.due_date && (
            <div className="task-due-date">
              <span className="due-date-label">Due:</span>
              <span className="due-date-value">
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className="task-footer">
          <span className="task-position">Position: {task.position + 1}</span>
          <span className="task-created">
            Created: {format(new Date(task.created_at), 'MMM dd')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
