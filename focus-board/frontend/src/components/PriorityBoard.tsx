import React, { useState } from 'react';
import { Task, TaskStatus, PriorityLevel, TaskCreate, TaskUpdate } from '../types/task';
import type { PriorityBoard as PriorityBoardType } from '../types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTheme } from '../contexts/ThemeContext';
import './PriorityBoard.css';

interface PriorityBoardProps {
  priorityBoard: PriorityBoardType;
  onTaskCreate: (taskData: TaskCreate) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

const PriorityBoard: React.FC<PriorityBoardProps> = ({
  priorityBoard,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { theme } = useTheme();

  const handleCreateTask = (taskData: TaskCreate | TaskUpdate) => {
    onTaskCreate({
      ...taskData,
      priority_board_id: priorityBoard.id,
      status: TaskStatus.PENDING
    } as TaskCreate);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = (taskData: TaskUpdate) => {
    if (editingTask) {
      onTaskUpdate({
        ...editingTask,
        ...taskData
      });
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    onTaskDelete(taskId);
  };

  const handleTaskStatusChange = (taskId: number, newStatus: TaskStatus) => {
    const task = priorityBoard.tasks.find((t: Task) => t.id === taskId);
    if (task) {
      onTaskUpdate({
        ...task,
        status: newStatus
      });
    }
  };

  const getPriorityTasks = (priority: PriorityLevel) => {
    return priorityBoard.tasks.filter((task: Task) => task.priority === priority);
  };

  const getPriorityLabel = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return 'Boss Tasks';
      case PriorityLevel.MEDIUM:
        return 'Milestones';
      case PriorityLevel.LOW:
        return 'Daily Quests';
      default:
        return 'Tasks';
    }
  };

  const getPriorityIcon = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return '🔥';
      case PriorityLevel.MEDIUM:
        return '⭐';
      case PriorityLevel.LOW:
        return '📝';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return 'var(--color-danger)';
      case PriorityLevel.MEDIUM:
        return 'var(--color-warning)';
      case PriorityLevel.LOW:
        return 'var(--color-success)';
      default:
        return 'var(--color-text-secondary-dark)';
    }
  };

  return (
    <div className={`priority-board ${theme}`}>
      <div className="board-header">
        <div className="board-info">
          <h2 className="text-h2 text-primary">{priorityBoard.name}</h2>
                     <p className="text-body text-secondary">Priority board for organizing quests</p>
        </div>
        <div className="board-actions">
          <button
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            + Add Quest
          </button>
        </div>
      </div>

      {priorityBoard.tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <div className="empty-icon">🎯</div>
          </div>
          <h4 className="text-h3 text-primary">No quests yet</h4>
          <p className="text-body text-secondary">
            Start your journey by creating your first quest!
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            Create Your First Quest
          </button>
        </div>
      ) : (
        <div className="priority-sections">
          {Object.values(PriorityLevel).map(priority => {
            const tasks = getPriorityTasks(priority);
            if (tasks.length === 0) return null;

            return (
              <div key={priority} className="priority-section">
                <div className="section-header">
                  <div className="section-title">
                    <span className="priority-icon" style={{ color: getPriorityColor(priority) }}>
                      {getPriorityIcon(priority)}
                    </span>
                    <h3 className="text-h3 text-primary">{getPriorityLabel(priority)}</h3>
                    <span className="task-count">({tasks.length})</span>
                  </div>
                </div>
                                 <div className="tasks-grid">
                   {tasks.map((task: Task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
               priorityBoardId={priorityBoard.id}
             />
          </div>
        </div>
      )}

      {/* Edit Task Form Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-h3 text-primary">Edit Quest</h3>
              <button
                className="btn-tertiary"
                onClick={() => setEditingTask(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
                         <TaskForm
               onSubmit={handleUpdateTask}
               onCancel={() => setEditingTask(null)}
               task={editingTask}
               priorityBoardId={priorityBoard.id}
               isEditing={true}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityBoard;
