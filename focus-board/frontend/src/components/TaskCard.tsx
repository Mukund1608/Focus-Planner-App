import React, { useState } from 'react';
import { Task, PriorityLevel, TaskStatus, ReminderType, RecurringPattern } from '../types/task';
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
        return '#EF4444'; // danger
      case PriorityLevel.HIGH:
        return '#6D7BFF'; // blue-accent (changed from orange)
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

  const hasReminder = task.reminder_enabled && task.reminder_type !== ReminderType.NONE;
  const isRecurring = task.is_recurring && task.recurring_pattern !== RecurringPattern.NONE;
  const isActive = task.status === TaskStatus.IN_PROGRESS;
  const isCompleted = task.status === TaskStatus.COMPLETED;

  // Calculate progress for quest completion
  const progress = isCompleted ? 100 : isActive ? 50 : 0;

  return (
    <div className={`quest-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      {/* Quest Leader Stripe */}
      <div 
        className="quest-leader-stripe"
        style={{ backgroundColor: getPriorityColor(task.priority) }}
      />
      
      <div className="quest-content">
        <div className="quest-header">
          <div className="quest-badges">
            <span className="badge badge-priority">
              {getPriorityIcon(task.priority)} {getPriorityLabel(task.priority)}
            </span>
            {hasReminder && (
              <span className="badge badge-reminder" title="Has reminder">
                ⏰ Reminder
              </span>
            )}
            {isRecurring && (
              <span className="badge badge-recurring" title="Recurring quest">
                🔄 Recurring
              </span>
            )}
          </div>
          
                     <div className="quest-actions">
             <button 
               className="quest-action-btn" 
               onClick={() => onEdit(task)}
               title="Edit quest"
             >
               ✏️
             </button>
             <button 
               className="quest-action-btn" 
               onClick={() => onDelete(task.id)}
               title="Delete quest"
             >
               🗑️
             </button>
           </div>
        </div>

        <div className="quest-main">
          <h3 className="quest-title" onClick={() => setIsExpanded(!isExpanded)}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`quest-description ${isExpanded ? 'expanded' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Progress Ring */}
          <div className="quest-progress">
            <div className="progress-ring">
              <svg className="progress-ring-svg" width="60" height="60">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  r="26"
                  cx="30"
                  cy="30"
                />
                <circle
                  className="progress-ring-circle"
                  stroke={getPriorityColor(task.priority)}
                  strokeWidth="4"
                  fill="transparent"
                  r="26"
                  cx="30"
                  cy="30"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                />
              </svg>
              <div className="progress-text">
                <span className="progress-percentage">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quest-meta">
          <div className="quest-status">
            <label htmlFor={`status-${task.id}`} className="status-label">Status:</label>
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
            <div className="quest-due-date">
              <span className="due-date-icon">📅</span>
              <span className="due-date-value">
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Quest Features Details */}
        {isExpanded && (hasReminder || isRecurring) && (
          <div className="quest-features-details">
            {hasReminder && (
              <div className="feature-detail">
                <span className="feature-icon">⏰</span>
                <span className="feature-text">
                  Reminder: {task.reminder_type === ReminderType.BROWSER ? 'Browser' : 
                           task.reminder_type === ReminderType.EMAIL ? 'Email' : 'Both'}
                </span>
              </div>
            )}
            {isRecurring && (
              <div className="feature-detail">
                <span className="feature-icon">🔄</span>
                <span className="feature-text">
                  Repeats: {task.recurring_pattern === RecurringPattern.DAILY ? 'Daily' :
                           task.recurring_pattern === RecurringPattern.WEEKLY ? 'Weekly' :
                           task.recurring_pattern === RecurringPattern.MONTHLY ? 'Monthly' : 'Custom'}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="quest-footer">
          <span className="quest-position">Position: {task.position + 1}</span>
          <span className="quest-created">
            Created: {format(new Date(task.created_at), 'MMM dd')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
