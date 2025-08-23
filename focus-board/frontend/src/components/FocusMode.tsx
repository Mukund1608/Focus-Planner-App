import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './FocusMode.css';

interface TimerConfig {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
}

const FocusMode: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentPhase, setCurrentPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const { theme } = useTheme();
  
  const intervalRef = useRef<number | null>(null);

  const timerConfig: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (currentPhase === 'work') {
      setCompletedSessions(prev => prev + 1);
      setTotalFocusTime(prev => prev + timerConfig.workDuration);
      
      // Check if it's time for a long break
      const nextSession = currentSession + 1;
      if (nextSession % timerConfig.sessionsUntilLongBreak === 0) {
        setCurrentPhase('longBreak');
        setTimeLeft(timerConfig.longBreakDuration * 60);
      } else {
        setCurrentPhase('shortBreak');
        setTimeLeft(timerConfig.shortBreakDuration * 60);
      }
      setCurrentSession(nextSession);
    } else {
      // Break finished, start next work session
      setCurrentPhase('work');
      setTimeLeft(timerConfig.workDuration * 60);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentSession(1);
    setCurrentPhase('work');
    setTimeLeft(timerConfig.workDuration * 60);
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = (): string => {
    switch (currentPhase) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const getPhaseDescription = (): string => {
    switch (currentPhase) {
      case 'work':
        return 'Stay focused and complete your quest!';
      case 'shortBreak':
        return 'Take a quick breather and stretch.';
      case 'longBreak':
        return 'Great work! Take a longer break to recharge.';
      default:
        return 'Stay focused and complete your quest!';
    }
  };

  const getProgressPercentage = (): number => {
    const totalTime = currentPhase === 'work' 
      ? timerConfig.workDuration * 60
      : currentPhase === 'shortBreak'
      ? timerConfig.shortBreakDuration * 60
      : timerConfig.longBreakDuration * 60;
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className={`focus-mode ${theme}`}>
      <div className="focus-header">
        <h1 className="text-display text-primary">Focus Mode</h1>
        <p className="text-body-lg text-secondary">
          Enter the zone and complete your quests with laser focus!
        </p>
      </div>

      <div className="focus-container">
        {/* Timer Display */}
        <div className="timer-section">
          <div className="timer-card">
            <div className="timer-header">
              <h2 className="text-h2 text-primary">{getPhaseTitle()}</h2>
              <p className="text-body text-secondary">{getPhaseDescription()}</p>
            </div>

            <div className="timer-display">
              <div className="time-display">
                <span className="time-text">{formatTime(timeLeft)}</span>
              </div>
              
              <div className="progress-ring">
                <svg className="progress-svg" viewBox="0 0 120 120">
                  <circle
                    className="progress-background"
                    cx="60"
                    cy="60"
                    r="54"
                    strokeWidth="8"
                  />
                  <circle
                    className="progress-fill"
                    cx="60"
                    cy="60"
                    r="54"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`}
                  />
                </svg>
              </div>
            </div>

            <div className="timer-controls">
              {!isRunning ? (
                <button
                  className="btn-primary btn-large"
                  onClick={startTimer}
                >
                  Start Focus Session
                </button>
              ) : (
                <button
                  className="btn-secondary btn-large"
                  onClick={pauseTimer}
                >
                  Pause
                </button>
              )}
              
              <button
                className="btn-tertiary"
                onClick={skipPhase}
                disabled={!isRunning}
              >
                Skip Phase
              </button>
              
              <button
                className="btn-tertiary"
                onClick={resetTimer}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="stats-section">
          <div className="stats-card">
            <h3 className="text-h3 text-primary">Session Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{currentSession}</span>
                <span className="stat-label">Current Session</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{completedSessions}</span>
                <span className="stat-label">Completed Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{totalFocusTime}</span>
                <span className="stat-label">Total Focus Minutes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {timerConfig.sessionsUntilLongBreak - (currentSession % timerConfig.sessionsUntilLongBreak)}
                </span>
                <span className="stat-label">Sessions Until Long Break</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timer Configuration */}
        <div className="config-section">
          <div className="config-card">
            <h3 className="text-h3 text-primary">Timer Settings</h3>
            <div className="config-grid">
              <div className="config-item">
                <span className="config-label">Work Duration</span>
                <span className="config-value">{timerConfig.workDuration} minutes</span>
              </div>
              <div className="config-item">
                <span className="config-label">Short Break</span>
                <span className="config-value">{timerConfig.shortBreakDuration} minutes</span>
              </div>
              <div className="config-item">
                <span className="config-label">Long Break</span>
                <span className="config-value">{timerConfig.longBreakDuration} minutes</span>
              </div>
              <div className="config-item">
                <span className="config-label">Sessions per Cycle</span>
                <span className="config-value">{timerConfig.sessionsUntilLongBreak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
