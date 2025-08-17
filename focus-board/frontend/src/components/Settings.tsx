import React, { useState, useEffect } from 'react';
import { Task, ReminderType } from '../types/task';
import { taskAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import './Settings.css';

const Settings: React.FC = () => {
  const [pendingReminders, setPendingReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeSection, setActiveSection] = useState('notifications');

  useEffect(() => {
    checkNotificationPermission();
    loadPendingReminders();
    
    // Set up periodic reminder checking (every 5 minutes)
    const interval = setInterval(loadPendingReminders, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const loadPendingReminders = async () => {
    try {
      setLoading(true);
      const reminders = await taskAPI.getPendingReminders();
      setPendingReminders(reminders);
      setError(null);
    } catch (err) {
      setError('Failed to load pending reminders');
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReminderAction = async (task: Task, action: 'view' | 'dismiss') => {
    try {
      // Mark reminder as sent
      await taskAPI.markReminderSent(task.id);
      
      // Remove from pending reminders
      setPendingReminders(prev => prev.filter(r => r.id !== task.id));
    } catch (err) {
      setError('Failed to process reminder action');
      console.error('Error processing reminder:', err);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
        // Process any pending reminders that should show notifications
        await processPendingReminders();
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const processPendingReminders = async () => {
    if (notificationPermission !== 'granted') {
      return;
    }

    for (const reminder of pendingReminders) {
      if (reminder.reminder_type === ReminderType.BROWSER || reminder.reminder_type === ReminderType.BOTH) {
        try {
          await notificationService.showTaskReminder(reminder.title, reminder.due_date || '');
        } catch (err) {
          console.error('Error showing notification for task:', reminder.id, err);
        }
      }
    }
  };

  const processRecurringTasks = async () => {
    try {
      setLoading(true);
      const result = await taskAPI.processRecurring();
      
      if (result.created_tasks.length > 0) {
        // Show notifications for new recurring tasks
        for (const task of result.created_tasks) {
          if (task.next_occurrence) {
            await notificationService.showRecurringTaskCreated(task.title, task.next_occurrence);
          }
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to process recurring tasks');
      console.error('Error processing recurring tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'reminders', label: 'Reminders', icon: '⏰' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'account', label: 'Account', icon: '👤' }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Browser Notifications</h4>
                <p>Receive notifications for task reminders and updates</p>
              </div>
              <div className="setting-control">
                {notificationPermission === 'default' && (
                  <button onClick={requestNotificationPermission} className="btn-primary">
                    Enable Notifications
                  </button>
                )}
                {notificationPermission === 'granted' && (
                  <span className="status-badge success">Enabled</span>
                )}
                {notificationPermission === 'denied' && (
                  <span className="status-badge error">Disabled</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'reminders':
        return (
          <div className="settings-section">
            <h3>Reminder Management</h3>
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {pendingReminders.length > 0 && (
              <div className="pending-reminders">
                <h4>Pending Reminders ({pendingReminders.length})</h4>
                <div className="reminders-list">
                  {pendingReminders.map(reminder => (
                    <div key={reminder.id} className="reminder-item">
                      <div className="reminder-content">
                        <h5>{reminder.title}</h5>
                        <p className="reminder-time">
                          Due: {new Date(reminder.due_date || '').toLocaleString()}
                        </p>
                      </div>
                      <div className="reminder-actions">
                        <button 
                          onClick={() => handleReminderAction(reminder, 'dismiss')}
                          className="btn-dismiss"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button 
                onClick={loadPendingReminders}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? 'Loading...' : 'Refresh Reminders'}
              </button>
              <button 
                onClick={processRecurringTasks}
                disabled={loading}
                className="btn-secondary"
              >
                Process Recurring Tasks
              </button>
              <button 
                onClick={async () => {
                  try {
                    await notificationService.showTaskReminder('Test Task', new Date(Date.now() + 60000).toISOString());
                  } catch (err) {
                    console.error('Test notification failed:', err);
                  }
                }}
                className="btn-secondary"
              >
                Test Notification
              </button>
              <button 
                onClick={async () => {
                  try {
                    await notificationService.manualCheck();
                  } catch (err) {
                    console.error('Manual check failed:', err);
                  }
                }}
                className="btn-secondary"
              >
                Manual Reminder Check
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h3>Appearance Settings</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Switch between light and dark themes</p>
              </div>
              <div className="setting-control">
                <span className="status-badge info">Coming Soon</span>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="settings-section">
            <h3>Account Settings</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Profile</h4>
                <p>Manage your account information</p>
              </div>
              <div className="setting-control">
                <span className="status-badge info">Coming Soon</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your FocusBoard experience</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="sidebar-icon">{section.icon}</span>
              <span className="sidebar-label">{section.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
