import React, { useState } from 'react';
import { ExamInputs, ExamSubject, ExamDifficulty } from '../types/task';
import './ExamInput.css';

interface ExamInputProps {
  onSubmit: (inputs: ExamInputs) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ExamInput: React.FC<ExamInputProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [subjects, setSubjects] = useState<ExamSubject[]>([
    { id: '1', name: '', examDate: '', difficulty: ExamDifficulty.MEDIUM }
  ]);
  const [dailyHours, setDailyHours] = useState(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<string[]>([]);

  const addSubject = () => {
    const newId = (subjects.length + 1).toString();
    setSubjects([...subjects, { id: newId, name: '', examDate: '', difficulty: ExamDifficulty.MEDIUM }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof ExamSubject, value: string) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const validateInputs = (): boolean => {
    const newErrors: string[] = [];

    // Validate subjects
    subjects.forEach((subject, index) => {
      if (!subject.name.trim()) {
        newErrors.push(`Subject ${index + 1}: Name is required`);
      }
      if (!subject.examDate) {
        newErrors.push(`Subject ${index + 1}: Exam date is required`);
      } else {
        const examDate = new Date(subject.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (examDate <= today) {
          newErrors.push(`Subject ${index + 1}: Exam date must be in the future`);
        }
      }
    });

    // Validate daily hours
    if (dailyHours < 0.5 || dailyHours > 16) {
      newErrors.push('Daily study hours must be between 0.5 and 16 hours');
    }

    // Validate start date
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      newErrors.push('Start date cannot be in the past');
    }

    // Check for duplicate subject names
    const names = subjects.map(s => s.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      newErrors.push('Subject names must be unique');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    const examInputs: ExamInputs = {
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name.trim(),
        examDate: s.examDate,
        difficulty: s.difficulty
      })),
      dailyHours,
      startDate,
      reserveRevision: true,
      blockMinutes: 50,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      longBreakEveryNBlocks: 3
    };

    onSubmit(examInputs);
  };

  const getDifficultyColor = (difficulty: ExamDifficulty): string => {
    switch (difficulty) {
      case ExamDifficulty.EASY: return '#22c55e';
      case ExamDifficulty.MEDIUM: return '#8b5cf6';
      case ExamDifficulty.HARD: return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyLabel = (difficulty: ExamDifficulty): string => {
    switch (difficulty) {
      case ExamDifficulty.EASY: return 'Easy';
      case ExamDifficulty.MEDIUM: return 'Medium';
      case ExamDifficulty.HARD: return 'Hard';
      default: return 'Medium';
    }
  };

  return (
    <div className="exam-input-overlay">
      <div className="exam-input-modal">
        <div className="exam-input-header">
          <h2 className="text-h1">📚 Create Study Schedule</h2>
          <p className="text-body">
            Configure your subjects, exam dates, and study preferences to generate a personalized study schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="exam-input-form">
          {/* Study Time Configuration */}
          <div className="form-section">
            <h3 className="section-title">⏰ Study Time Configuration</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dailyHours">Daily Study Hours</label>
                <input
                  type="number"
                  id="dailyHours"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="form-input"
                  required
                />
                <span className="form-hint">Hours per day you can dedicate to studying (0.5 - 16 hours)</span>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  required
                />
                <span className="form-hint">When to start your study schedule</span>
              </div>
            </div>
          </div>

          {/* Subjects Configuration */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">📖 Subjects</h3>
              <button
                type="button"
                onClick={addSubject}
                className="btn-secondary"
                disabled={isLoading}
              >
                ➕ Add Subject
              </button>
            </div>

            <div className="subjects-list">
              {subjects.map((subject, index) => (
                <div key={subject.id} className="subject-card">
                  <div className="subject-header">
                    <h4 className="subject-title">Subject {index + 1}</h4>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(subject.id)}
                        className="remove-btn"
                        disabled={isLoading}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="subject-fields">
                    <div className="form-group">
                      <label htmlFor={`subject-${subject.id}-name`}>Subject Name</label>
                      <input
                        type="text"
                        id={`subject-${subject.id}-name`}
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        placeholder="e.g., Mathematics, Physics, History"
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`subject-${subject.id}-examDate`}>Exam Date</label>
                        <input
                          type="date"
                          id={`subject-${subject.id}-examDate`}
                          value={subject.examDate}
                          onChange={(e) => updateSubject(subject.id, 'examDate', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`subject-${subject.id}-difficulty`}>Difficulty</label>
                                                 <select
                           id={`subject-${subject.id}-difficulty`}
                           value={subject.difficulty}
                           onChange={(e) => updateSubject(subject.id, 'difficulty', e.target.value as ExamDifficulty)}
                           className="form-select"
                         >
                           <option value={ExamDifficulty.EASY}>Easy</option>
                           <option value={ExamDifficulty.MEDIUM}>Medium</option>
                           <option value={ExamDifficulty.HARD}>Hard</option>
                         </select>
                        <div 
                          className="difficulty-indicator"
                          style={{ backgroundColor: getDifficultyColor(subject.difficulty) }}
                        >
                          {getDifficultyLabel(subject.difficulty)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  ⚠️ {error}
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Generating Schedule...' : '🚀 Generate Study Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamInput;
