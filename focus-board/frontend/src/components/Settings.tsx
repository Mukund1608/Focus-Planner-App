import React, { useState, useEffect } from 'react';
import { Task, ReminderType } from '../types/task';
import { taskAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import './Settings.css';

interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  habitReminders: boolean;
  completionNotifications: boolean;
  overdueNotifications: boolean;
  recurringTaskNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const Settings: React.FC = () => {
  const [pendingReminders, setPendingReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeSection, setActiveSection] = useState('notifications');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    taskReminders: true,
    habitReminders: true,
    completionNotifications: true,
    overdueNotifications: true,
    recurringTaskNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [testMessage, setTestMessage] = useState('Test notification from FocusBoard');

  useEffect(() => {
    checkNotificationPermission();
    loadPendingReminders();
    loadNotificationSettings();
    
    // Set up periodic reminder checking (every 2 minutes)
    const interval = setInterval(loadPendingReminders, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationSettings(prev => ({
        ...prev,
        enabled: Notification.permission === 'granted'
      }));
    }
  };

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setNotificationSettings(prev => ({ ...prev, ...settings }));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  };

  const saveNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
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
      
      setSuccess('Reminder processed successfully');
      setTimeout(() => setSuccess(null), 3000);
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
        saveNotificationSettings({ enabled: true });
        setSuccess('Notifications enabled successfully!');
        setTimeout(() => setSuccess(null), 3000);
        
        // Process any pending reminders that should show notifications
        await processPendingReminders();
      } else {
        setError('Notification permission was denied. Please enable it in your browser settings.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('Error requesting notification permission');
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
          await notificationService.showTaskReminder(reminder.title, reminder.due_date || '', reminder.id);
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
        setSuccess(`${result.created_tasks.length} recurring tasks processed successfully`);
      } else {
        setSuccess('No recurring tasks to process');
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to process recurring tasks');
      console.error('Error processing recurring tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.testNotification(testMessage);
      setSuccess('Test notification sent successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to send test notification');
      console.error('Test notification failed:', err);
    }
  };

  const clearAllReminders = async () => {
    try {
      setLoading(true);
      for (const reminder of pendingReminders) {
        await taskAPI.markReminderSent(reminder.id);
      }
      setPendingReminders([]);
      setSuccess('All reminders cleared successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to clear reminders');
      console.error('Error clearing reminders:', err);
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
            
            {success && (
              <div className="success-message">
                {success}
                <button onClick={() => setSuccess(null)}>×</button>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            <div className="notification-status-card">
              <div className="status-header">
                <h4>Browser Notifications</h4>
                <div className="status-indicator">
                  {notificationPermission === 'granted' && (
                    <span className="status-badge success">✓ Enabled</span>
                  )}
                  {notificationPermission === 'denied' && (
                    <span className="status-badge error">✗ Disabled</span>
                  )}
                  {notificationPermission === 'default' && (
                    <span className="status-badge info">? Not Set</span>
                  )}
                </div>
              </div>
              
              <p className="status-description">
                {notificationPermission === 'granted' 
                  ? 'You will receive notifications for task reminders and updates.'
                  : notificationPermission === 'denied'
                  ? 'Notifications are disabled. Please enable them in your browser settings.'
                  : 'Click "Enable Notifications" to receive task reminders and updates.'
                }
              </p>

                {notificationPermission === 'default' && (
                  <button onClick={requestNotificationPermission} className="btn-primary">
                    Enable Notifications
                  </button>
                )}

                {notificationPermission === 'denied' && (
                <div className="permission-help">
                  <p>To enable notifications:</p>
                  <ol>
                    <li>Click the lock/info icon in your browser's address bar</li>
                    <li>Change "Notifications" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>

            {notificationPermission === 'granted' && (
              <>
                <div className="notification-options">
                  <h4>Notification Types</h4>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Task Reminders</h5>
                      <p>Get notified when tasks are due soon</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.taskReminders}
                          onChange={(e) => saveNotificationSettings({ taskReminders: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Habit Reminders</h5>
                      <p>Get reminded to complete your daily habits</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.habitReminders}
                          onChange={(e) => saveNotificationSettings({ habitReminders: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Completion Notifications</h5>
                      <p>Celebrate when you complete tasks</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.completionNotifications}
                          onChange={(e) => saveNotificationSettings({ completionNotifications: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Overdue Notifications</h5>
                      <p>Get notified about overdue tasks</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.overdueNotifications}
                          onChange={(e) => saveNotificationSettings({ overdueNotifications: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Recurring Task Notifications</h5>
                      <p>Get notified when new recurring tasks are created</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.recurringTaskNotifications}
                          onChange={(e) => saveNotificationSettings({ recurringTaskNotifications: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="notification-options">
                  <h4>Notification Preferences</h4>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Sound</h5>
                      <p>Play sound with notifications</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.soundEnabled}
                          onChange={(e) => saveNotificationSettings({ soundEnabled: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h5>Vibration</h5>
                      <p>Vibrate device with notifications (mobile)</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.vibrationEnabled}
                          onChange={(e) => saveNotificationSettings({ vibrationEnabled: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
              </div>
            </div>
                </div>

                <div className="notification-test">
                  <h4>Test Notifications</h4>
                  <p>Click the button below to open the notification test center for comprehensive testing.</p>
                  <button 
                    onClick={() => {
                      // Open notification test in a new window/tab
                      window.open('/notification-test', '_blank');
                    }}
                    className="btn-primary"
                  >
                    Open Notification Test Center
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'reminders':
        return (
          <div className="settings-section">
            <h3>Reminder Management</h3>
            
            {success && (
              <div className="success-message">
                {success}
                <button onClick={() => setSuccess(null)}>×</button>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {pendingReminders.length > 0 && (
              <div className="pending-reminders">
                <div className="reminders-header">
                <h4>Pending Reminders ({pendingReminders.length})</h4>
                  <button 
                    onClick={clearAllReminders}
                    disabled={loading}
                    className="btn-clear"
                  >
                    Clear All
                  </button>
                </div>
                <div className="reminders-list">
                  {pendingReminders.map(reminder => (
                    <div key={reminder.id} className="reminder-item">
                      <div className="reminder-content">
                        <h5>{reminder.title}</h5>
                        <p className="reminder-time">
                          Due: {new Date(reminder.due_date || '').toLocaleString()}
                        </p>
                        <span className="reminder-type">
                          {reminder.reminder_type === ReminderType.BROWSER ? 'Browser' : 
                           reminder.reminder_type === ReminderType.EMAIL ? 'Email' : 'Both'}
                        </span>
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

            {pendingReminders.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⏰</div>
                <h4>No Pending Reminders</h4>
                <p>All your reminders are up to date!</p>
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
                    await notificationService.manualCheck();
                    setSuccess('Manual reminder check completed');
                    setTimeout(() => setSuccess(null), 3000);
                  } catch (err) {
                    setError('Manual check failed');
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
