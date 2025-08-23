import React, { useState, useEffect } from 'react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';

import './Settings.css';

const Settings: React.FC = () => {
  const session = useSessionContext();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('15');
  const [testMessage, setTestMessage] = useState('Test notification from UpNXT');
  const [testType, setTestType] = useState<'basic' | 'task' | 'habit' | 'completion' | 'overdue'>('basic');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load user preferences from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedNotifications = localStorage.getItem('notificationsEnabled') === 'true';
    const savedEmailNotifications = localStorage.getItem('emailNotifications') === 'true';
    const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    const savedReminderTime = localStorage.getItem('reminderTime') || '15';

    setTheme(savedTheme as 'light' | 'dark');
    setNotificationsEnabled(savedNotifications);
    setEmailNotifications(savedEmailNotifications);
    setSoundEnabled(savedSoundEnabled);
    setReminderTime(savedReminderTime);
  }, [setTheme]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', enabled.toString());
    
    if (enabled) {
      requestNotificationPermission();
    }
  };

  const handleEmailNotificationToggle = (enabled: boolean) => {
    setEmailNotifications(enabled);
    localStorage.setItem('emailNotifications', enabled.toString());
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem('reminderTime', time);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationsEnabled(false);
        localStorage.setItem('notificationsEnabled', 'false');
      }
    }
  };

  const handleExportData = () => {
    // Export user data
    const userData = {
      theme,
      notificationsEnabled,
      emailNotifications,
      soundEnabled,
      reminderTime,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'upnxt-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.theme) handleThemeChange(data.theme);
        if (typeof data.notificationsEnabled === 'boolean') {
          handleNotificationToggle(data.notificationsEnabled);
        }
        if (typeof data.emailNotifications === 'boolean') {
          handleEmailNotificationToggle(data.emailNotifications);
        }
        if (typeof data.soundEnabled === 'boolean') {
          handleSoundToggle(data.soundEnabled);
        }
        if (data.reminderTime) {
          handleReminderTimeChange(data.reminderTime);
        }
        
        alert('Settings imported successfully!');
      } catch {
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const runNotificationTest = async () => {
    setIsTestLoading(true);
    setTestResult(null);

    try {
      switch (testType) {
        case 'basic':
          await notificationService.testNotification(testMessage);
          break;
        case 'task':
          await notificationService.showTaskReminder(
            'Test Task',
            new Date(Date.now() + 60000).toISOString(),
            999
          );
          break;
        case 'habit':
          await notificationService.showHabitReminder('Test Habit', 5);
          break;
        case 'completion':
          await notificationService.showTaskCompleted('Test Task');
          break;
        case 'overdue':
          await notificationService.showTaskOverdue('Test Task', 999);
          break;
      }

      setTestResult({
        type: 'success',
        message: `${testType.charAt(0).toUpperCase() + testType.slice(1)} notification sent successfully!`
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const getPermissionStatus = () => {
    const permission = notificationService.getPermissionStatus();
    const isSupported = notificationService.isSupported();
    const isInitialized = notificationService.isServiceInitialized();

    if (!isSupported) {
      return { status: 'unsupported', message: 'Notifications not supported in this browser' };
    }

    if (!isInitialized) {
      return { status: 'initializing', message: 'Notification service is initializing...' };
    }

    switch (permission) {
      case 'granted':
        return { status: 'granted', message: 'Notifications are enabled and working' };
      case 'denied':
        return { status: 'denied', message: 'Notifications are disabled. Please enable them in browser settings.' };
      case 'default':
        return { status: 'default', message: 'Notification permission not set. Click "Enable Notifications" first.' };
      default:
        return { status: 'unknown', message: 'Unknown permission status' };
    }
  };

  return (
    <div className={`settings ${theme}`}>
      <div className="settings-header">
        <h1 className="text-display text-primary">Settings</h1>
        <p className="text-body-lg text-secondary">
          Customize your UpNXT experience and manage your preferences.
        </p>
      </div>

      <div className="settings-container">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h2 className="text-h2 text-primary">Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Theme</h3>
              <p className="text-body text-secondary">Choose your preferred color scheme</p>
            </div>
            <div className="setting-control">
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀️ Light
                </button>
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2 className="text-h2 text-primary">Notifications</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Push Notifications</h3>
              <p className="text-body text-secondary">Receive notifications for quest reminders</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Email Notifications</h3>
              <p className="text-body text-secondary">Receive email reminders for important quests</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => handleEmailNotificationToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Sound Effects</h3>
              <p className="text-body text-secondary">Play sounds for notifications and quest completion</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Reminder Time</h3>
              <p className="text-body text-secondary">Minutes before due date to send reminders</p>
            </div>
            <div className="setting-control">
              <select
                value={reminderTime}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="form-select"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Test */}
        <div className="settings-section">
          <h2 className="text-h2 text-primary">Notification Test</h2>
          
          <div className="permission-status">
            <div className={`status-card ${getPermissionStatus().status}`}>
              <div className="status-icon">
                {getPermissionStatus().status === 'granted' && '✓'}
                {getPermissionStatus().status === 'denied' && '✗'}
                {getPermissionStatus().status === 'default' && '?'}
                {getPermissionStatus().status === 'unsupported' && '⚠️'}
                {getPermissionStatus().status === 'initializing' && '⏳'}
              </div>
              <div className="status-content">
                <h4>Permission Status</h4>
                <p>{getPermissionStatus().message}</p>
              </div>
            </div>
          </div>

          {getPermissionStatus().status === 'granted' && (
            <div className="test-section">
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="text-h3 text-primary">Test Notifications</h3>
                  <p className="text-body text-secondary">Send test notifications to verify they're working</p>
                </div>
                <div className="setting-control">
                  <div className="test-controls">
                    <select 
                      value={testType} 
                      onChange={(e) => setTestType(e.target.value as 'basic' | 'task' | 'habit' | 'completion' | 'overdue')}
                      className="form-select"
                    >
                      <option value="basic">Basic Notification</option>
                      <option value="task">Task Reminder</option>
                      <option value="habit">Habit Reminder</option>
                      <option value="completion">Task Completion</option>
                      <option value="overdue">Overdue Task</option>
                    </select>
                    
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message..."
                      className="form-input"
                      disabled={testType !== 'basic'}
                    />
                    
                    <button 
                      onClick={runNotificationTest}
                      disabled={isTestLoading}
                      className="btn-primary"
                    >
                      {isTestLoading ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                  
                  {testResult && (
                    <div className={`test-result ${testResult.type}`}>
                      <span className="result-icon">
                        {testResult.type === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="result-message">{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {getPermissionStatus().status === 'default' && (
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="text-h3 text-primary">Enable Notifications</h3>
                <p className="text-body text-secondary">To test notifications, you need to enable them first</p>
              </div>
              <div className="setting-control">
                <button 
                  onClick={async () => {
                    try {
                      const granted = await notificationService.requestPermission();
                      if (granted) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error requesting permission:', error);
                    }
                  }}
                  className="btn-primary"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2 className="text-h2 text-primary">Data Management</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Export Settings</h3>
              <p className="text-body text-secondary">Download your settings as a backup</p>
            </div>
            <div className="setting-control">
              <button className="btn-secondary" onClick={handleExportData}>
                Export
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Import Settings</h3>
              <p className="text-body text-secondary">Restore settings from a backup file</p>
            </div>
            <div className="setting-control">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file" className="btn-secondary">
                Import
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">Clear All Data</h3>
              <p className="text-body text-secondary">Remove all local data and reset to defaults</p>
            </div>
            <div className="setting-control">
              <button className="btn-danger" onClick={handleClearData}>
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="settings-section">
          <h2 className="text-h2 text-primary">Account</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="text-h3 text-primary">User ID</h3>
              <p className="text-body text-secondary">Your unique identifier</p>
            </div>
            <div className="setting-control">
              <span className="text-body text-secondary">
                {session.loading ? 'Loading...' : session.doesSessionExist ? session.userId : 'Not logged in'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
