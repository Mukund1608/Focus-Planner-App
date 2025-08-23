import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './HabitTracker.css';

interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface HabitCreate {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}



const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState<HabitCreate>({
    name: '',
    description: '',
    frequency: 'daily'
  });
  const { theme } = useTheme();

  // Mock data for demonstration
  useEffect(() => {
    const mockHabits: Habit[] = [
      {
        id: 1,
        name: 'Morning Exercise',
        description: '30 minutes of cardio or strength training',
        frequency: 'daily',
        streak: 7,
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Read 30 Pages',
        description: 'Read at least 30 pages of a book',
        frequency: 'daily',
        streak: 12,
        completed: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Weekly Review',
        description: 'Review and plan for the upcoming week',
        frequency: 'weekly',
        streak: 4,
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
    setHabits(mockHabits);
  }, []);

  const handleCreateHabit = (habitData: HabitCreate) => {
    const newHabit: Habit = {
      id: Date.now(),
      name: habitData.name,
      description: habitData.description,
      frequency: habitData.frequency,
      streak: 0,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setHabits(prev => [...prev, newHabit]);
    setShowForm(false);
    setNewHabit({ name: '', description: '', frequency: 'daily' });
  };

  const handleToggleHabit = (habitId: number) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const completed = !habit.completed;
        return {
          ...habit,
          completed,
          streak: completed ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          updated_at: new Date().toISOString()
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (habitId: number) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const getFrequencyIcon = (frequency: string): string => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '📅';
    }
  };

  const getFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Daily';
    }
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 10) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '💪';
    return '🎯';
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => habit.completed).length;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);

  return (
    <div className={`habit-tracker ${theme}`}>
      <div className="habit-header">
        <h1 className="text-display text-primary">Habit Tracker</h1>
        <p className="text-body-lg text-secondary">
          Build lasting habits and track your daily progress!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stats-card">
          <h3 className="text-h3 text-primary">Today's Progress</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{totalHabits}</span>
              <span className="stat-label">Total Habits</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{completedHabits}</span>
              <span className="stat-label">Completed Today</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0}%
              </span>
              <span className="stat-label">Completion Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalStreak}</span>
              <span className="stat-label">Total Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="habits-section">
        <div className="habits-header">
          <h3 className="text-h3 text-primary">Your Habits</h3>
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Add Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">🎯</div>
            </div>
            <h4 className="text-h3 text-primary">No habits yet</h4>
            <p className="text-body text-secondary">
              Start building positive habits to level up your life!
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map(habit => (
              <div key={habit.id} className={`habit-card ${habit.completed ? 'completed' : ''}`}>
                <div className="habit-header">
                  <div className="habit-info">
                    <h4 className="text-h4 text-primary">{habit.name}</h4>
                    <p className="text-body text-secondary">{habit.description}</p>
                  </div>
                  <div className="habit-meta">
                    <span className="frequency-badge">
                      {getFrequencyIcon(habit.frequency)} {getFrequencyLabel(habit.frequency)}
                    </span>
                  </div>
                </div>

                <div className="habit-stats">
                  <div className="streak-info">
                    <span className="streak-emoji">{getStreakEmoji(habit.streak)}</span>
                    <span className="streak-count">{habit.streak} day streak</span>
                  </div>
                </div>

                <div className="habit-actions">
                  <button
                    className={`btn-primary ${habit.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleHabit(habit.id)}
                  >
                    {habit.completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  <button
                    className="btn-tertiary"
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

      {/* Add Habit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-h3 text-primary">Create New Habit</h3>
              <button
                className="btn-tertiary"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form
              className="habit-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateHabit(newHabit);
              }}
            >
              <div className="form-group">
                <label htmlFor="habit-name" className="form-label">Habit Name</label>
                <input
                  id="habit-name"
                  type="text"
                  className="form-input"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Exercise"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="habit-description" className="form-label">Description</label>
                <textarea
                  id="habit-description"
                  className="form-textarea"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this habit involves..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="habit-frequency" className="form-label">Frequency</label>
                <select
                  id="habit-frequency"
                  className="form-select"
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit(prev => ({ 
                    ...prev, 
                    frequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                  }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newHabit.name.trim()}
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
