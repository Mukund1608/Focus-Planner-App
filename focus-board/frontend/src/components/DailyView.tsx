import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Task, TaskStatus, PriorityLevel, ReminderType, RecurringPattern } from '../types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTheme } from '../contexts/ThemeContext';
import './DailyView.css';

interface DailyViewProps {
  tasks?: Task[];
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  tasks: propTasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}) => {
  // Internal state management when no props are provided
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const tasks = propTasks || internalTasks;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { theme } = useTheme();

  // Load demo data on mount if no props provided
  useEffect(() => {
    if (!propTasks) {
      const demoTasks: Task[] = [
        {
          id: 1,
          title: 'Complete morning workout',
          description: 'Full body strength training session',
          status: TaskStatus.COMPLETED,
          priority: PriorityLevel.HIGH,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'demo-user',
          priority_board_id: 1,
          position: 0,
          reminder_enabled: true,
          reminder_type: ReminderType.BROWSER,
          reminder_sent: false,
          is_recurring: true,
          recurring_pattern: RecurringPattern.DAILY
        },
        {
          id: 2,
          title: 'Review project proposal',
          description: 'Go through the Q1 project requirements and feedback',
          status: TaskStatus.IN_PROGRESS,
          priority: PriorityLevel.HIGH,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'demo-user',
          priority_board_id: 1,
          position: 1,
          reminder_enabled: true,
          reminder_type: ReminderType.EMAIL,
          reminder_sent: false,
          is_recurring: false,
          recurring_pattern: RecurringPattern.NONE
        },
        {
          id: 3,
          title: 'Team standup meeting',
          description: 'Daily sync with the development team',
          status: TaskStatus.PENDING,
          priority: PriorityLevel.MEDIUM,
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'demo-user',
          priority_board_id: 1,
          position: 2,
          reminder_enabled: true,
          reminder_type: ReminderType.BROWSER,
          reminder_sent: false,
          is_recurring: true,
          recurring_pattern: RecurringPattern.DAILY
        }
      ];
      setInternalTasks(demoTasks);
    }
  }, [propTasks]);

  // Filter tasks for the selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date || '');
      return isToday(taskDate) || format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => subDays(prev, 1));
    } else {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  const handleTaskStatusChange = (taskId: number, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      } else {
        setInternalTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    }
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now(),
      title: taskData.title || 'New Quest',
      description: taskData.description || '',
      status: TaskStatus.PENDING,
      priority: taskData.priority || PriorityLevel.MEDIUM,
      due_date: taskData.due_date || format(selectedDate, 'yyyy-MM-dd'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'demo-user',
      priority_board_id: 1,
      position: tasks.length,
      reminder_enabled: taskData.reminder_enabled || false,
      reminder_type: taskData.reminder_type || ReminderType.EMAIL,
      reminder_sent: false,
      is_recurring: taskData.is_recurring || false,
      recurring_pattern: taskData.recurring_pattern || RecurringPattern.NONE
    };

    if (onTaskCreate) {
      onTaskCreate(newTask);
    } else {
      setInternalTasks(prev => [...prev, newTask]);
    }
    setShowTaskForm(false);
  };

  const handleEditTask = (updatedTask: Task) => {
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    } else {
      setInternalTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
  };

  const handleDeleteTask = (taskId: number) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    } else {
      setInternalTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const dailyTasks = getTasksForDate(selectedDate);
  const todayTasks = getTasksForDate(new Date());

  return (
    <div className={`daily-view ${theme}`}>
      <div className="daily-header">
        <h1 className="text-display text-primary">Daily Quests</h1>
        <p className="text-body-lg text-secondary">
          Complete your daily missions and level up your productivity!
        </p>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <button
          className="btn-secondary"
          onClick={() => handleDateChange('prev')}
          aria-label="Previous day"
        >
          ←
        </button>
        <h2 className="text-h2 text-primary">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button
          className="btn-secondary"
          onClick={() => handleDateChange('next')}
          aria-label="Next day"
        >
          →
        </button>
      </div>

      {/* Today's Overview */}
      {isToday(selectedDate) && (
        <div className="today-overview">
          <div className="overview-card">
            <h3 className="text-h3 text-primary">Today's Progress</h3>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-number">{todayTasks.length}</span>
                <span className="stat-label">Total Quests</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {todayTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {todayTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                </span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="daily-tasks">
        <div className="tasks-header">
          <h3 className="text-h3 text-primary">
            Quests for {format(selectedDate, 'MMMM d')}
          </h3>
          <button
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            + Add Quest
          </button>
        </div>

        {dailyTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">📅</div>
            </div>
            <h4 className="text-h3 text-primary">No quests scheduled</h4>
            <p className="text-body text-secondary">
              {isToday(selectedDate) 
                ? "Start your day by adding your first quest!"
                : "No quests planned for this day yet."
              }
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowTaskForm(true)}
            >
              Create Your First Quest
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {dailyTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-h3 text-primary">Create New Quest</h3>
              <button
                className="btn-tertiary"
                onClick={() => setShowTaskForm(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
              priorityBoardId={1}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyView;
