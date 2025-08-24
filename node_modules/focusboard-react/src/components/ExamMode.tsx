import React, { useState, useEffect } from 'react';
import { ExamInputs, ExamSchedule, ExamTask } from '../types/task';
import { examAPI } from '../services/api';
import ExamInput from './ExamInput';
import ExamScheduleView from './ExamScheduleView';
import './ExamMode.css';

const ExamMode: React.FC = () => {
  const [schedule, setSchedule] = useState<ExamSchedule | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing schedule on component mount
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await examAPI.getSchedule();
      
      if (response.schedule) {
        setSchedule(response.schedule);
        setShowInput(false);
      } else {
        // No active schedule found, stay on landing page
        setSchedule(null);
        setShowInput(false);
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Failed to load exam schedule. Please try again.');
      setSchedule(null);
      setShowInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async (inputs: ExamInputs) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Generating schedule with inputs:', inputs);

      const scheduleData = await examAPI.generateSchedule({
        subjects: inputs.subjects,
        dailyHours: inputs.dailyHours,
        startDate: inputs.startDate,
        reserveRevision: inputs.reserveRevision,
        blockMinutes: inputs.blockMinutes,
        shortBreakMinutes: inputs.shortBreakMinutes,
        longBreakMinutes: inputs.longBreakMinutes,
        longBreakEveryNBlocks: inputs.longBreakEveryNBlocks
      });

      console.log('Schedule generated:', scheduleData);

      setSchedule(scheduleData);
      setShowInput(false);
      setSuccessMessage(`Study plan created for ${scheduleData.days.length} days!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      setError(err.message || 'Failed to generate study schedule. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await examAPI.completeTask({ taskId, completed });
      
      // Update the schedule locally
      if (schedule) {
        const updatedSchedule = { ...schedule };
        
        // Find and update the task
        for (const day of updatedSchedule.days) {
          const task = day.tasks.find(t => t.id === taskId);
          if (task) {
            task.completedAt = completed ? new Date().toISOString() : undefined;
            break;
          }
        }
        
        setSchedule(updatedSchedule);
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to update task completion. Please try again.');
    }
  };

  const handleRegenerate = () => {
    setShowInput(true);
  };

  const handleDeleteSchedule = async () => {
    if (window.confirm('Are you sure you want to delete this study schedule? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        console.log('Attempting to delete schedule...');
        const result = await examAPI.deleteSchedule();
        console.log('Delete result:', result);
        setSchedule(null);
        setSuccessMessage('Study schedule deleted successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error('Error deleting schedule:', err);
        const errorMessage = err.message || 'Failed to delete study schedule. Please try again.';
        setError(errorMessage);
        // If it's an authentication error, suggest re-login
        if (err.message && err.message.includes('unauthorized')) {
          setError('Authentication required. Please refresh the page and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelInput = () => {
    setShowInput(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading && !schedule && !showInput) {
    return (
      <div className="exam-mode">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading exam mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-mode">
             {/* Header - Removed */}

      {/* Messages */}
      {error && (
        <div className="message error-message" onClick={clearMessages}>
          <span className="message-icon">⚠️</span>
          <span className="message-text">{error}</span>
          <button className="message-close">×</button>
        </div>
      )}

      {successMessage && (
        <div className="message success-message" onClick={clearMessages}>
          <span className="message-icon">✅</span>
          <span className="message-text">{successMessage}</span>
          <button className="message-close">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="exam-mode-content">
        {showInput ? (
          <ExamInput
            onSubmit={handleGenerateSchedule}
            onCancel={handleCancelInput}
            isLoading={isLoading}
          />
        ) : schedule ? (
          <ExamScheduleView
            schedule={schedule}
            onTaskComplete={handleTaskComplete}
            onRegenerate={handleRegenerate}
            onDelete={handleDeleteSchedule}
            isLoading={isLoading}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">📚</div>
              <h3 className="text-h2">Welcome to Exam Mode</h3>
              <p className="text-body">
                Create your first exam study schedule to get started with personalized study planning. 
                Our intelligent algorithm will help you create an optimal study plan based on your subjects, 
                exam dates, and available study time.
              </p>
              <button
                className="btn-primary"
                onClick={() => setShowInput(true)}
              >
                ➕ Create Study Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Section - Removed */}
    </div>
  );
};

export default ExamMode;
