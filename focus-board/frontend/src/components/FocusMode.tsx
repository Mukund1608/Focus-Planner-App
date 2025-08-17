import React, { useState, useEffect, useCallback } from 'react';
import { Task, PriorityLevel, TaskStatus } from '../types/task';
import { taskAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import './FocusMode.css';

interface FocusModeProps {}

interface TimerConfig {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

interface TimerState {
  isRunning: boolean;
  isBreak: boolean;
  isLongBreak: boolean;
  timeLeft: number; // in seconds
  currentSession: number;
  totalSessions: number;
}

const FocusMode: React.FC<FocusModeProps> = () => {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  });

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isBreak: false,
    isLongBreak: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    currentSession: 0,
    totalSessions: 0
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks based on selected priority
  useEffect(() => {
    if (selectedPriority === 'all') {
      setFilteredTasks(tasks.filter(task => task.status !== TaskStatus.COMPLETED));
    } else {
      setFilteredTasks(tasks.filter(task => 
        task.priority === selectedPriority && task.status !== TaskStatus.COMPLETED
      ));
    }
  }, [tasks, selectedPriority]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer finished
            handleTimerComplete();
            return prev;
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.timeLeft]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await taskAPI.getAll();
      setTasks(allTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimerComplete = useCallback(() => {
    // Try to play notification sound, but don't fail if it doesn't exist
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {}); // Ignore errors if audio fails to play
    } catch (error) {
      // Silently ignore if audio file doesn't exist
    }

    setTimerState(prev => {
      if (prev.isBreak) {
        // Break finished, start work session
        const isLongBreak = prev.currentSession % timerConfig.sessionsUntilLongBreak === 0;
        return {
          isRunning: false,
          isBreak: false,
          isLongBreak: false,
          timeLeft: timerConfig.workDuration * 60,
          currentSession: prev.currentSession + 1,
          totalSessions: prev.totalSessions + 1
        };
      } else {
        // Work session finished, start break
        const isLongBreak = (prev.currentSession + 1) % timerConfig.sessionsUntilLongBreak === 0;
        return {
          isRunning: false,
          isBreak: true,
          isLongBreak,
          timeLeft: isLongBreak ? timerConfig.longBreakDuration * 60 : timerConfig.breakDuration * 60,
          currentSession: prev.currentSession,
          totalSessions: prev.totalSessions
        };
      }
    });

    // Show notification
    if (Notification.permission === 'granted') {
      const title = timerState.isBreak ? 'Break Time Over!' : 'Work Session Complete!';
      const body = timerState.isBreak 
        ? 'Time to get back to work!' 
        : 'Great job! Take a break.';
      new Notification(title, { body });
    }
  }, [timerState.isBreak, timerState.currentSession, timerConfig]);

  const startTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }));
  };

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      isBreak: false,
      isLongBreak: false,
      timeLeft: timerConfig.workDuration * 60,
      currentSession: 0,
      totalSessions: 0
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      await taskAPI.update(taskId, { status: TaskStatus.COMPLETED });
      await loadTasks(); // Reload tasks to reflect changes
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleTaskStart = (task: Task) => {
    setCurrentTask(task);
    if (!isFocusModeActive) {
      setIsFocusModeActive(true);
    }
  };

  const exitFocusMode = () => {
    setIsFocusModeActive(false);
    setCurrentTask(null);
  };

  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT: return '#ff4757';
      case PriorityLevel.HIGH: return '#ff6b35';
      case PriorityLevel.MEDIUM: return '#ffa726';
      case PriorityLevel.LOW: return '#66bb6a';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.URGENT: return 'Urgent';
      case PriorityLevel.HIGH: return 'High';
      case PriorityLevel.MEDIUM: return 'Medium';
      case PriorityLevel.LOW: return 'Low';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="focus-mode">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="focus-mode">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadTasks} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`focus-mode ${isFocusModeActive ? 'focus-active' : ''} ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="focus-header">
        <h2>Focus Mode</h2>
        <p>Distraction-free environment for deep work</p>
      </div>

      {!isFocusModeActive ? (
        // Focus Mode Setup
        <div className="focus-setup">
          <div className="priority-filter">
            <h3>Filter by Priority</h3>
            <div className="priority-buttons">
              <button
                className={`priority-btn ${selectedPriority === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPriority('all')}
              >
                All Tasks ({tasks.filter(t => t.status !== TaskStatus.COMPLETED).length})
              </button>
              {Object.values(PriorityLevel).map(priority => (
                <button
                  key={priority}
                  className={`priority-btn ${selectedPriority === priority ? 'active' : ''}`}
                  onClick={() => setSelectedPriority(priority)}
                  style={{ borderColor: getPriorityColor(priority) }}
                >
                  {getPriorityLabel(priority)} ({tasks.filter(t => t.priority === priority && t.status !== TaskStatus.COMPLETED).length})
                </button>
              ))}
            </div>
          </div>

          <div className="task-list">
            <h3>Available Tasks</h3>
            {filteredTasks.length === 0 ? (
              <div className="no-tasks">
                <p>No tasks available for the selected priority.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <span 
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      ></span>
                      <h4>{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-actions">
                      <button
                        className="start-task-btn"
                        onClick={() => handleTaskStart(task)}
                      >
                        Start Task
                      </button>
                      <button
                        className="complete-task-btn"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Active Focus Mode
        <div className="focus-active-container">
          <div className="focus-controls">
            <button className="exit-focus-btn" onClick={exitFocusMode}>
              Exit Focus Mode
            </button>
          </div>

          <div className="current-task-section">
            <h3>Current Task</h3>
            {currentTask && (
              <div className="current-task-card">
                <div className="task-header">
                  <span 
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(currentTask.priority) }}
                  ></span>
                  <h4>{currentTask.title}</h4>
                </div>
                {currentTask.description && (
                  <p className="task-description">{currentTask.description}</p>
                )}
                <div className="task-actions">
                  <button
                    className="complete-task-btn"
                    onClick={() => {
                      handleTaskComplete(currentTask.id);
                      setCurrentTask(null);
                    }}
                  >
                    Complete Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timer Section */}
          <div className="timer-section">
            <h3>Deep Work Timer</h3>
            <div className="timer-display">
              <div className="timer-time">{formatTime(timerState.timeLeft)}</div>
              <div className="timer-status">
                {timerState.isBreak 
                  ? (timerState.isLongBreak ? 'Long Break' : 'Short Break')
                  : 'Work Session'
                }
              </div>
              <div className="session-info">
                Session {timerState.currentSession + 1} of {timerConfig.sessionsUntilLongBreak}
              </div>
            </div>

            <div className="timer-controls">
              {!timerState.isRunning ? (
                <button className="start-timer-btn" onClick={startTimer}>
                  Start Timer
                </button>
              ) : (
                <button className="pause-timer-btn" onClick={pauseTimer}>
                  Pause Timer
                </button>
              )}
              <button className="reset-timer-btn" onClick={resetTimer}>
                Reset Timer
              </button>
            </div>

            <div className="timer-config">
              <h4>Timer Settings</h4>
              <div className="config-grid">
                <div className="config-item">
                  <label>Work Duration (min):</label>
                  <input
                    type="number"
                    value={timerConfig.workDuration}
                    onChange={(e) => setTimerConfig(prev => ({
                      ...prev,
                      workDuration: parseInt(e.target.value) || 25
                    }))}
                    min="1"
                    max="120"
                  />
                </div>
                <div className="config-item">
                  <label>Break Duration (min):</label>
                  <input
                    type="number"
                    value={timerConfig.breakDuration}
                    onChange={(e) => setTimerConfig(prev => ({
                      ...prev,
                      breakDuration: parseInt(e.target.value) || 5
                    }))}
                    min="1"
                    max="30"
                  />
                </div>
                <div className="config-item">
                  <label>Long Break Duration (min):</label>
                  <input
                    type="number"
                    value={timerConfig.longBreakDuration}
                    onChange={(e) => setTimerConfig(prev => ({
                      ...prev,
                      longBreakDuration: parseInt(e.target.value) || 15
                    }))}
                    min="5"
                    max="60"
                  />
                </div>
                <div className="config-item">
                  <label>Sessions until Long Break:</label>
                  <input
                    type="number"
                    value={timerConfig.sessionsUntilLongBreak}
                    onChange={(e) => setTimerConfig(prev => ({
                      ...prev,
                      sessionsUntilLongBreak: parseInt(e.target.value) || 4
                    }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
