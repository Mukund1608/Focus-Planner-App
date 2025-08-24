import React, { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate, PriorityLevel, TaskStatus, ReminderType, RecurringPattern } from '../types/task';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task;
  priorityBoardId: number;
  onSubmit: (taskData: TaskCreate | TaskUpdate) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  priorityBoardId,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<TaskCreate | TaskUpdate>({
    title: '',
    description: '',
    priority: PriorityLevel.MEDIUM,
    status: TaskStatus.PENDING,
    due_date: '',
    reminder_enabled: false,
    reminder_type: ReminderType.NONE,
    reminder_advance: '15',
    is_recurring: false,
    recurring_pattern: RecurringPattern.NONE,
    ...(isEditing ? {} : { priority_board_id: priorityBoardId })
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        reminder_enabled: task.reminder_enabled,
        reminder_type: task.reminder_type,
        reminder_advance: task.reminder_advance || '15',
        is_recurring: task.is_recurring,
        recurring_pattern: task.recurring_pattern,
      });
    }
  }, [task, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Validate reminder settings
    if (formData.reminder_enabled && !formData.due_date) {
      newErrors.reminder = 'Due date is required when reminders are enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h2>{isEditing ? 'Edit Quest' : 'Create New Quest'}</h2>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter task title"
              maxLength={200}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Enter task description (optional)"
              rows={3}
              maxLength={1000}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || PriorityLevel.MEDIUM}
                onChange={handleInputChange}
              >
                {Object.values(PriorityLevel).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || TaskStatus.PENDING}
                onChange={handleInputChange}
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>
                    {status === TaskStatus.COMPLETED ? 'Completed' :
                     status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Pending'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date || ''}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Advanced Options Toggle */}
          <div className="advanced-options-toggle">
            <button
              type="button"
              className="btn-toggle"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? '▼' : '▶'} Advanced Options
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="advanced-options">
              {/* Reminder Settings */}
              <div className="form-section">
                <h3>Reminder Settings</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="reminder_enabled"
                      checked={formData.reminder_enabled || false}
                      onChange={handleInputChange}
                    />
                    Enable Reminder
                  </label>
                </div>

                {formData.reminder_enabled && (
                  <>
                    <div className="form-group">
                      <label htmlFor="reminder_type">Reminder Type</label>
                      <select
                        id="reminder_type"
                        name="reminder_type"
                        value={formData.reminder_type || ReminderType.NONE}
                        onChange={handleInputChange}
                      >
                        {Object.values(ReminderType).map(type => (
                          <option key={type} value={type}>
                            {type === ReminderType.NONE ? 'None' :
                             type === ReminderType.EMAIL ? 'Email' :
                             type === ReminderType.BROWSER ? 'Browser Notification' :
                             'Both Email & Browser'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reminder_advance">Remind me</label>
                      <select
                        id="reminder_advance"
                        name="reminder_advance"
                        value={formData.reminder_advance || '15'}
                        onChange={handleInputChange}
                      >
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="1440">1 day before</option>
                      </select>
                    </div>
                    
                    {formData.reminder_type === ReminderType.BROWSER || formData.reminder_type === ReminderType.BOTH ? (
                      <div className="form-group">
                        <div className="info-box">
                          <span className="info-icon">ℹ️</span>
                          <p>Browser notifications will appear even when the app is closed (if permission is granted).</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {/* Recurring Task Settings */}
              <div className="form-section">
                <h3>Recurring Task Settings</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring || false}
                      onChange={handleInputChange}
                    />
                    Make this a recurring task
                  </label>
                </div>

                {formData.is_recurring && (
                  <div className="form-group">
                    <label htmlFor="recurring_pattern">Recurring Pattern</label>
                    <select
                      id="recurring_pattern"
                      name="recurring_pattern"
                      value={formData.recurring_pattern || RecurringPattern.NONE}
                      onChange={handleInputChange}
                    >
                      {Object.values(RecurringPattern).map(pattern => (
                        <option key={pattern} value={pattern}>
                          {pattern === RecurringPattern.NONE ? 'None' :
                           pattern === RecurringPattern.DAILY ? 'Daily' :
                           pattern === RecurringPattern.WEEKLY ? 'Weekly' :
                           pattern === RecurringPattern.MONTHLY ? 'Monthly' :
                           'Custom'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.reminder && <span className="error-message">{errors.reminder}</span>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Update Quest' : 'Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
