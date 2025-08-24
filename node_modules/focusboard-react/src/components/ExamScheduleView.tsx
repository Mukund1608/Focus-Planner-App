import React, { useState, useEffect } from 'react';
import { ExamSchedule, ExamTask, ExamDifficulty } from '../types/task';
import './ExamScheduleView.css';

interface ExamScheduleViewProps {
  schedule: ExamSchedule;
  onTaskComplete: (taskId: string, completed: boolean) => void;
  onRegenerate: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

const ExamScheduleView: React.FC<ExamScheduleViewProps> = ({
  schedule,
  onTaskComplete,
  onRegenerate,
  onDelete,
  isLoading = false
}) => {
  // viewMode state removed since only calendar view is used
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Get tasks for selected date
  const getTasksForDate = (date: string): ExamTask[] => {
    const day = schedule.days.find(d => d.day.startsWith(date));
    return day?.tasks || [];
  };

  {/* Task Board related functions removed */}

  // Get subject color
  const getSubjectColor = (subjectId: string): string => {
    // Generate deterministic color based on subject ID
    const colors = [
      '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    
    const hash = subjectId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty: ExamDifficulty): { text: string; color: string } => {
    switch (difficulty) {
      case ExamDifficulty.EASY:
        return { text: 'Easy', color: '#22C55E' };
      case ExamDifficulty.MEDIUM:
        return { text: 'Medium', color: '#8B5CF6' };
      case ExamDifficulty.HARD:
        return { text: 'Hard', color: '#EF4444' };
      default:
        return { text: 'Medium', color: '#8B5CF6' };
    }
  };

  // Format time
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }
    return `${mins}m`;
  };

  // Calendar View
  const CalendarView = () => (
    <div className="calendar-view">
      <div className="calendar-header">
        <h3 className="text-h2">📅 Study Calendar</h3>
        <div className="calendar-controls">
          <button
            className="btn-secondary"
            onClick={() => setSelectedDate(today)}
          >
            Today
          </button>
          <button
            className="btn-secondary"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Regenerating...' : '🔄 Regenerate Plan'}
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {schedule.days.map((day) => {
          const isToday = day.day.startsWith(today);
          const isSelected = day.day.startsWith(selectedDate);
          const hasTasks = day.tasks.length > 0;
          
          return (
            <div
              key={day.day}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasTasks ? 'has-tasks' : ''}`}
              onClick={() => setSelectedDate(day.day.split('T')[0])}
            >
              <div className="day-header">
                <span className="day-date">
                  {new Date(day.day).getDate()}
                </span>
                <span className="day-name">
                  {new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
              
              {hasTasks && (
                <div className="day-tasks">
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-chip ${task.completedAt ? 'completed' : ''}`}
                      style={{ borderLeftColor: getSubjectColor(task.subjectId) }}
                      title={`${task.subjectName} - ${formatTime(task.plannedMinutes)}`}
                    >
                      <span className="task-subject">{task.subjectName}</span>
                      <span className="task-time">{formatTime(task.plannedMinutes)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {day.totalPlannedMinutes > 0 && (
                <div className="day-total">
                  {formatTime(day.totalPlannedMinutes)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details - Removed */}
    </div>
  );

  {/* Task Board View - Removed */}

  {/* Task Card Component - Removed */}

  return (
    <div className="exam-schedule-view">
      <div className="view-header">
        <h2 className="text-h1">📚 Exam Study Schedule</h2>
        <div className="view-controls">
          <button
            className="btn-secondary"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            ✏️ Edit Plan
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this study schedule? This action cannot be undone.')) {
                onDelete?.();
              }
            }}
            disabled={isLoading}
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            🗑️ Delete Plan
          </button>
        </div>
      </div>

      <CalendarView />
    </div>
  );
};

export default ExamScheduleView;
