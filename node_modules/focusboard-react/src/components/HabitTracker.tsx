import React, { useState, useEffect } from 'react';
import { Habit, HabitCreate, HabitUpdate, HabitCompletionCreate, HabitStats, HabitFrequency } from '../types/task';
import { habitAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import './HabitTracker.css';

interface HabitTrackerProps {}

const HabitTracker: React.FC<HabitTrackerProps> = () => {
  const { isDarkMode } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [completingHabit, setCompletingHabit] = useState<Habit | null>(null);

  // Form states
  const [formData, setFormData] = useState<HabitCreate>({
    title: '',
    description: '',
    frequency: HabitFrequency.DAILY,
    target_count: 1,
    color: '#667eea',
    icon: '🔄'
  });

  const [completionNotes, setCompletionNotes] = useState('');

  // Load habits and stats on component mount
  useEffect(() => {
    loadHabits();
    loadStats();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const allHabits = await habitAPI.getAll();
      setHabits(allHabits);
      setError(null);
    } catch (err) {
      setError('Failed to load habits');
      console.error('Error loading habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const habitStats = await habitAPI.getStats();
      setStats(habitStats);
    } catch (err) {
      console.error('Error loading habit stats:', err);
    }
  };

  const handleCreateHabit = async () => {
    try {
      const newHabit = await habitAPI.create(formData);
      setHabits(prev => [newHabit, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        frequency: HabitFrequency.DAILY,
        target_count: 1,
        color: '#667eea',
        icon: '🔄'
      });
      await loadStats();
    } catch (err) {
      setError('Failed to create habit');
      console.error('Error creating habit:', err);
    }
  };

  const handleUpdateHabit = async (habitId: number, updates: HabitUpdate) => {
    try {
      const updatedHabit = await habitAPI.update(habitId, updates);
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? updatedHabit : habit
      ));
      setEditingHabit(null);
      await loadStats();
    } catch (err) {
      setError('Failed to update habit');
      console.error('Error updating habit:', err);
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await habitAPI.delete(habitId);
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
      await loadStats();
    } catch (err) {
      setError('Failed to delete habit');
      console.error('Error deleting habit:', err);
    }
  };

  const handleCompleteHabit = async (habitId: number) => {
    try {
      const completion: HabitCompletionCreate = {
        notes: completionNotes.trim() || undefined
      };
      
      await habitAPI.complete(habitId, completion);
      
      // Update the habit in the list with new stats
      const updatedHabit = await habitAPI.getById(habitId);
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? updatedHabit : habit
      ));
      
      setCompletingHabit(null);
      setCompletionNotes('');
      await loadStats();
    } catch (err) {
      setError('Failed to complete habit');
      console.error('Error completing habit:', err);
    }
  };

  const getFrequencyLabel = (frequency: HabitFrequency): string => {
    switch (frequency) {
      case HabitFrequency.DAILY: return 'Daily';
      case HabitFrequency.WEEKLY: return 'Weekly';
      case HabitFrequency.MONTHLY: return 'Monthly';
      case HabitFrequency.CUSTOM: return 'Custom';
      default: return 'Unknown';
    }
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥';
    if (streak >= 21) return '⚡';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '🎯';
    if (streak >= 3) return '✨';
    return '🌟';
  };

  const getMotivationalMessage = (streak: number): string => {
    if (streak >= 30) return 'Incredible! You\'re on fire! 🔥';
    if (streak >= 21) return 'Amazing! You\'ve built a strong habit! ⚡';
    if (streak >= 14) return 'Great job! Keep up the momentum! 💪';
    if (streak >= 7) return 'Well done! You\'re making progress! 🎯';
    if (streak >= 3) return 'Good start! Keep going! ✨';
    return 'Start your streak today! 🌟';
  };

  const getProgressPercentage = (habit: Habit): number => {
    const today = new Date().toDateString();
    const todayCompletions = habit.completions.filter(completion => 
      new Date(completion.completed_at).toDateString() === today
    ).length;
    
    return Math.min((todayCompletions / habit.target_count) * 100, 100);
  };

  if (loading) {
    return (
      <div className="habit-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading habits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="habit-tracker">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadHabits} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`habit-tracker ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="habit-header">
        <h2>Habit Tracker</h2>
        <p>Build positive habits and track your progress</p>
        <button 
          className="create-habit-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Habit
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.total_habits}</h3>
                <p>Total Habits</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.active_habits}</h3>
                <p>Active Habits</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{stats.total_completions_today}</h3>
                <p>Completed Today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <h3>{stats.longest_current_streak}</h3>
                <p>Best Streak</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Habit Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Habit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="form-group">
              <label>Habit Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Morning Exercise"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your habit..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as HabitFrequency }))}
                >
                  <option value={HabitFrequency.DAILY}>Daily</option>
                  <option value={HabitFrequency.WEEKLY}>Weekly</option>
                  <option value={HabitFrequency.MONTHLY}>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.target_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_count: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🔄"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateHabit}
                disabled={!formData.title.trim()}
              >
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Habit Modal */}
      {completingHabit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complete Habit</h3>
              <button 
                className="close-btn"
                onClick={() => setCompletingHabit(null)}
              >
                ✕
              </button>
            </div>
            <div className="habit-completion-info">
              <span className="habit-icon" style={{ color: completingHabit.color }}>
                {completingHabit.icon}
              </span>
              <h4>{completingHabit.title}</h4>
              <p>Current Streak: {completingHabit.current_streak} {getStreakEmoji(completingHabit.current_streak)}</p>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="How did it go?"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setCompletingHabit(null)}
              >
                Cancel
              </button>
              <button 
                className="complete-btn"
                onClick={() => handleCompleteHabit(completingHabit.id)}
              >
                Complete Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="habits-section">
        <h3>Your Habits</h3>
        {habits.length === 0 ? (
          <div className="no-habits">
            <div className="no-habits-icon">🔄</div>
            <h4>No habits yet</h4>
            <p>Create your first habit to start building positive routines!</p>
            <button 
              className="create-first-habit-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map(habit => (
              <div key={habit.id} className={`habit-card ${!habit.is_active ? 'inactive' : ''}`}>
                <div className="habit-header">
                  <div className="habit-info">
                    <span 
                      className="habit-icon"
                      style={{ color: habit.color }}
                    >
                      {habit.icon}
                    </span>
                    <div className="habit-details">
                      <h4>{habit.title}</h4>
                      <p className="habit-frequency">
                        {getFrequencyLabel(habit.frequency)} • Target: {habit.target_count}
                      </p>
                    </div>
                  </div>
                  <div className="habit-status">
                    {habit.is_active ? (
                      <span className="status-active">Active</span>
                    ) : (
                      <span className="status-inactive">Inactive</span>
                    )}
                  </div>
                </div>

                {habit.description && (
                  <p className="habit-description">{habit.description}</p>
                )}

                <div className="habit-stats">
                  <div className="stat-item">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value">
                      {habit.current_streak} {getStreakEmoji(habit.current_streak)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Best Streak</span>
                    <span className="stat-value">{habit.longest_streak}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{habit.total_completions}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${getProgressPercentage(habit)}%`,
                        backgroundColor: habit.color
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round(getProgressPercentage(habit))}% complete today
                  </span>
                </div>

                {/* Motivational Message */}
                <div className="motivational-message">
                  {getMotivationalMessage(habit.current_streak)}
                </div>

                <div className="habit-actions">
                  {habit.is_active && (
                    <button
                      className="complete-btn"
                      onClick={() => setCompletingHabit(habit)}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    className="edit-btn"
                    onClick={() => setEditingHabit(habit)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
