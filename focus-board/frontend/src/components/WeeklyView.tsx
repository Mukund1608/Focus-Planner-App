import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { Task, TaskStatus } from '../types/task';

import TaskForm from './TaskForm';
import { useTheme } from '../contexts/ThemeContext';
import './WeeklyView.css';

interface WeeklyViewProps {
  tasks?: Task[];
  onTaskCreate?: (task: any) => void;
  onTaskUpdate?: (task: any) => void;
  onTaskDelete?: (taskId: number) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks = [],
  onTaskCreate
}) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { theme } = useTheme();

  // Get the week days
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter tasks for the selected week
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date || '');
      return isSameDay(taskDate, date);
    });
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedWeek(newDate);
  };



  const handleCreateTask = (taskData: any) => {
    if (onTaskCreate && selectedDate) {
      onTaskCreate({
        ...taskData,
        due_date: format(selectedDate, 'yyyy-MM-dd'),
        status: TaskStatus.PENDING,
        completed: false
      });
    }
    setShowTaskForm(false);
    setSelectedDate(null);
  };



  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowTaskForm(true);
  };

  // Calculate weekly stats
  const weeklyTasks = weekDays.flatMap(day => getTasksForDate(day));
  const completedTasks = weeklyTasks.filter(task => task.status === TaskStatus.COMPLETED);
  const inProgressTasks = weeklyTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);

  return (
    <div className={`weekly-view ${theme}`}>
      <div className="weekly-header">
        <h1 className="text-display text-primary">Weekly Mission</h1>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button
          className="btn-secondary"
          onClick={() => handleWeekChange('prev')}
          aria-label="Previous week"
        >
          ← Previous Week
        </button>
        <h2 className="text-h2 text-primary">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <button
          className="btn-secondary"
          onClick={() => handleWeekChange('next')}
          aria-label="Next week"
        >
          Next Week →
        </button>
      </div>



      {/* Weekly Calendar */}
      <div className="weekly-calendar">
        <div className="calendar-header">
          <button
            className="btn-primary"
            onClick={() => {
              setSelectedDate(new Date());
              setShowTaskForm(true);
            }}
          >
            + Add Quest
          </button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${isCurrentDay ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-header">
                  <span className="day-name">{format(day, 'EEE')}</span>
                  <span className="day-date">{format(day, 'd')}</span>
                  {isCurrentDay && <span className="today-indicator">Today</span>}
                </div>
                
                <div className="day-tasks">
                  {dayTasks.length === 0 ? (
                    <div className="empty-day">
                      <span className="empty-text">No quests</span>
                    </div>
                  ) : (
                    <div className="task-preview">
                      {dayTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="task-preview-item">
                          <span className="task-title">{task.title}</span>
                          <span className={`task-status ${task.status.toLowerCase()}`}>
                            {task.status === TaskStatus.COMPLETED ? '✓' : task.status === TaskStatus.IN_PROGRESS ? '▶' : '○'}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="more-tasks">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && selectedDate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-h3 text-primary">
                Create Quest for {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              <button
                className="btn-tertiary"
                onClick={() => {
                  setShowTaskForm(false);
                  setSelectedDate(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setSelectedDate(null);
              }}
              priorityBoardId={1}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
