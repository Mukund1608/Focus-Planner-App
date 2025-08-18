import React, { useState } from 'react';
import { notificationService } from '../services/notificationService';
import './NotificationTest.css';

const NotificationTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('Test notification from FocusBoard');
  const [testType, setTestType] = useState<'basic' | 'task' | 'habit' | 'completion' | 'overdue'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);

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

      setResult({
        type: 'success',
        message: `${testType.charAt(0).toUpperCase() + testType.slice(1)} notification sent successfully!`
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
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

  const permissionInfo = getPermissionStatus();

  return (
    <div className="notification-test-container">
      <div className="test-header">
        <h3>🔔 Notification Test Center</h3>
        <p>Test and verify that browser notifications are working properly</p>
      </div>

      <div className="permission-status">
        <div className={`status-card ${permissionInfo.status}`}>
          <div className="status-icon">
            {permissionInfo.status === 'granted' && '✓'}
            {permissionInfo.status === 'denied' && '✗'}
            {permissionInfo.status === 'default' && '?'}
            {permissionInfo.status === 'unsupported' && '⚠️'}
            {permissionInfo.status === 'initializing' && '⏳'}
          </div>
          <div className="status-content">
            <h4>Permission Status</h4>
            <p>{permissionInfo.message}</p>
          </div>
        </div>
      </div>

      {permissionInfo.status === 'granted' && (
        <div className="test-section">
          <h4>Test Notifications</h4>
          
          <div className="test-controls">
            <div className="test-type-selector">
              <label>Notification Type:</label>
              <select 
                value={testType} 
                onChange={(e) => setTestType(e.target.value as any)}
                className="test-select"
              >
                <option value="basic">Basic Notification</option>
                <option value="task">Task Reminder</option>
                <option value="habit">Habit Reminder</option>
                <option value="completion">Task Completion</option>
                <option value="overdue">Overdue Task</option>
              </select>
            </div>

            <div className="test-message">
              <label>Message:</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
                className="test-input"
                disabled={testType !== 'basic'}
              />
            </div>

            <button 
              onClick={runTest}
              disabled={isLoading}
              className="test-button"
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
          </div>

          {result && (
            <div className={`test-result ${result.type}`}>
              <span className="result-icon">
                {result.type === 'success' ? '✓' : '✗'}
              </span>
              <span className="result-message">{result.message}</span>
            </div>
          )}
        </div>
      )}

      {permissionInfo.status === 'default' && (
        <div className="enable-section">
          <h4>Enable Notifications</h4>
          <p>To test notifications, you need to enable them first.</p>
          <button 
            onClick={async () => {
              try {
                const granted = await notificationService.requestPermission();
                if (granted) {
                  window.location.reload(); // Refresh to update status
                }
              } catch (error) {
                console.error('Error requesting permission:', error);
              }
            }}
            className="enable-button"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {permissionInfo.status === 'denied' && (
        <div className="help-section">
          <h4>How to Enable Notifications</h4>
          <div className="help-steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>Click the lock/info icon in your browser's address bar</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>Find "Notifications" in the site settings</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>Change it from "Block" to "Allow"</p>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <p>Refresh this page to test notifications</p>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>About Browser Notifications</h4>
        <ul>
          <li>Notifications work even when the app is not focused</li>
          <li>You can click on notifications to open the app</li>
          <li>Notifications are automatically dismissed after 8 seconds</li>
          <li>Mobile devices may vibrate with notifications</li>
          <li>You can manage notification settings in your browser</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationTest;
