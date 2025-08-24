import React, { useState, useEffect } from 'react';
import { ExamSchedule, ExamTask, ExamDifficulty } from '../types/task';
import './ExamScheduleView.css';

interface ExamScheduleViewProps {
  schedule: ExamSchedule;
  onTaskComplete: (taskId: string, completed: boolean) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

const ExamScheduleView: React.FC<ExamScheduleViewProps> = ({
  schedule,
  onTaskComplete,
  onRegenerate,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'board'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Get tasks for selected date
  const getTasksForDate = (date: string): ExamTask[] => {
    const day = schedule.days.find(d => d.day.startsWith(date));
    return day?.tasks || [];
  };

  // Get tasks for today
  const todayTasks = getTasksForDate(today);

  // Get tasks for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTasks = getTasksForDate(tomorrow.toISOString().split('T')[0]);

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = (): ExamTask[] => {
    const upcoming: ExamTask[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2); // Start from day after tomorrow
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const tasks = getTasksForDate(dateStr);
      upcoming.push(...tasks);
    }
    
    return upcoming;
  };

  // Get completed tasks
  const getCompletedTasks = (): ExamTask[] => {
    return schedule.days.flatMap(day => 
      day.tasks.filter(task => task.completedAt)
    );
  };

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

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="selected-day-details">
          <h4 className="text-h3">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          <div className="day-tasks-list">
            {getTasksForDate(selectedDate).map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completedAt ? 'completed' : ''}`}
              >
                <div className="task-info">
                  <div className="task-header">
                    <span 
                      className="task-subject-name"
                      style={{ color: getSubjectColor(task.subjectId) }}
                    >
                      {task.subjectName}
                    </span>
                    <span className="task-difficulty-badge" style={{ backgroundColor: getDifficultyBadge(task.difficulty).color }}>
                      {getDifficultyBadge(task.difficulty).text}
                    </span>
                  </div>
                  <div className="task-details">
                    <span className="task-time">{formatTime(task.plannedMinutes)}</span>
                    <span className="task-blocks">{task.pomodoroBlocks} blocks</span>
                  </div>
                </div>
                
                <button
                  className={`task-complete-btn ${task.completedAt ? 'completed' : ''}`}
                  onClick={() => onTaskComplete(task.id, !task.completedAt)}
                  disabled={isLoading}
                >
                  {task.completedAt ? '✅' : '⭕'}
                </button>
              </div>
            ))}
            
            {getTasksForDate(selectedDate).length === 0 && (
              <div className="no-tasks">
                <p>No study tasks scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Task Board View
  const TaskBoardView = () => (
    <div className="task-board-view">
      <div className="board-header">
        <h3 className="text-h2">📋 Study Tasks</h3>
        <div className="board-controls">
          <button
            className="btn-secondary"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Regenerating...' : '🔄 Regenerate Plan'}
          </button>
        </div>
      </div>

      <div className="board-columns">
        {/* Today Column */}
        <div className="board-column">
          <div className="column-header">
            <h4 className="text-h3">Today</h4>
            <span className="task-count">{todayTasks.length}</span>
          </div>
          <div className="task-cards">
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onTaskComplete} isLoading={isLoading} />
            ))}
            {todayTasks.length === 0 && (
              <div className="empty-column">
                <p>No tasks for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Tomorrow Column */}
        <div className="board-column">
          <div className="column-header">
            <h4 className="text-h3">Tomorrow</h4>
            <span className="task-count">{tomorrowTasks.length}</span>
          </div>
          <div className="task-cards">
            {tomorrowTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onTaskComplete} isLoading={isLoading} />
            ))}
            {tomorrowTasks.length === 0 && (
              <div className="empty-column">
                <p>No tasks for tomorrow</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Column */}
        <div className="board-column">
          <div className="column-header">
            <h4 className="text-h3">Upcoming</h4>
            <span className="task-count">{getUpcomingTasks().length}</span>
          </div>
          <div className="task-cards">
            {getUpcomingTasks().map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onTaskComplete} isLoading={isLoading} />
            ))}
            {getUpcomingTasks().length === 0 && (
              <div className="empty-column">
                <p>No upcoming tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="board-column">
          <div className="column-header">
            <h4 className="text-h3">Completed</h4>
            <span className="task-count">{getCompletedTasks().length}</span>
          </div>
          <div className="task-cards">
            {getCompletedTasks().map((task) => (
              <TaskCard key={task.id} task={task} onComplete={onTaskComplete} isLoading={isLoading} />
            ))}
            {getCompletedTasks().length === 0 && (
              <div className="empty-column">
                <p>No completed tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Task Card Component
  const TaskCard: React.FC<{ task: ExamTask; onComplete: (taskId: string, completed: boolean) => void; isLoading: boolean }> = ({ 
    task, 
    onComplete, 
    isLoading 
  }) => (
    <div className={`task-card ${task.completedAt ? 'completed' : ''}`}>
      <div 
        className="task-color-bar"
        style={{ backgroundColor: getSubjectColor(task.subjectId) }}
      />
      
      <div className="task-content">
        <div className="task-header">
          <h5 className="task-title">{task.subjectName}</h5>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyBadge(task.difficulty).color }}
          >
            {getDifficultyBadge(task.difficulty).text}
          </span>
        </div>
        
        <div className="task-details">
          <span className="task-time">⏱️ {formatTime(task.plannedMinutes)}</span>
          <span className="task-blocks">📦 {task.pomodoroBlocks} blocks</span>
        </div>
        
        {task.completedAt && (
          <div className="completion-time">
            ✅ Completed at {new Date(task.completedAt).toLocaleTimeString()}
          </div>
        )}
        
        <button
          className={`complete-btn ${task.completedAt ? 'completed' : ''}`}
          onClick={() => onComplete(task.id, !task.completedAt)}
          disabled={isLoading}
        >
          {task.completedAt ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="exam-schedule-view">
      <div className="view-header">
        <h2 className="text-h1">📚 Exam Study Schedule</h2>
        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar
            </button>
            <button
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              📋 Task Board
            </button>
          </div>
        </div>
      </div>

      <div className="schedule-info">
        <div className="info-card">
          <span className="info-label">Schedule Period</span>
          <span className="info-value">
            {new Date(schedule.fromDate).toLocaleDateString()} - {new Date(schedule.toDate).toLocaleDateString()}
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">Total Days</span>
          <span className="info-value">{schedule.days.length} days</span>
        </div>
        <div className="info-card">
          <span className="info-label">Version</span>
          <span className="info-value">v{schedule.version}</span>
        </div>
      </div>

      {viewMode === 'calendar' ? <CalendarView /> : <TaskBoardView />}
    </div>
  );
};

export default ExamScheduleView;
