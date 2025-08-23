import React, { useState, useEffect } from 'react';
import { PriorityBoard, Task, TaskStatus, PriorityLevel, ReminderType, RecurringPattern } from '../types/task';
import PriorityBoardComponent from './PriorityBoard';
import { useTheme } from '../contexts/ThemeContext';
import './PriorityBoards.css';

interface PriorityBoardsProps {
  boards?: PriorityBoard[];
  onBoardCreate?: (board: Partial<PriorityBoard>) => void;
  onTaskCreate?: (task: Partial<PriorityBoard['tasks'][0]>) => void;
  onTaskUpdate?: (task: PriorityBoard['tasks'][0]) => void;
  onTaskDelete?: (taskId: number) => void;
}

const PriorityBoards: React.FC<PriorityBoardsProps> = ({
  boards: propBoards,
  onBoardCreate,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}) => {
  // Internal state management when no props are provided
  const [internalBoards, setInternalBoards] = useState<PriorityBoard[]>([]);
  const boards = propBoards || internalBoards;
  const [selectedBoard, setSelectedBoard] = useState<PriorityBoard | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: ''
  });
  const { theme } = useTheme();

  // Load demo data on mount if no props provided
  useEffect(() => {
    if (!propBoards) {
      const demoBoards: PriorityBoard[] = [
        {
          id: 1,
          name: 'Work Projects',
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tasks: [
            {
              id: 1,
              title: 'Complete project proposal',
              description: 'Write and submit the Q1 project proposal',
              status: TaskStatus.IN_PROGRESS,
              priority: PriorityLevel.HIGH,
              due_date: new Date(Date.now() + 86400000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: 'demo-user',
              priority_board_id: 1,
              position: 0,
              reminder_enabled: true,
              reminder_type: ReminderType.EMAIL,
              reminder_sent: false,
              is_recurring: false,
              recurring_pattern: RecurringPattern.NONE
            },
            {
              id: 2,
              title: 'Review team feedback',
              description: 'Go through all team member feedback on the project',
              status: TaskStatus.PENDING,
              priority: PriorityLevel.MEDIUM,
              due_date: new Date(Date.now() + 172800000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: 'demo-user',
              priority_board_id: 1,
              position: 1,
              reminder_enabled: false,
              reminder_type: ReminderType.EMAIL,
              reminder_sent: false,
              is_recurring: false,
              recurring_pattern: RecurringPattern.NONE
            }
          ]
        },
        {
          id: 2,
          name: 'Personal Goals',
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tasks: [
            {
              id: 3,
              title: 'Read 2 chapters of productivity book',
              description: 'Continue reading "Getting Things Done"',
              status: TaskStatus.PENDING,
              priority: PriorityLevel.LOW,
              due_date: new Date(Date.now() + 259200000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: 'demo-user',
              priority_board_id: 2,
              position: 0,
              reminder_enabled: true,
              reminder_type: ReminderType.EMAIL,
              reminder_sent: false,
              is_recurring: true,
              recurring_pattern: RecurringPattern.WEEKLY
            }
          ]
        }
      ];
      setInternalBoards(demoBoards);
      setSelectedBoard(demoBoards[0]);
    }
  }, [propBoards]);

  const handleCreateBoard = (boardData: { name: string }) => {
    const newBoardData: PriorityBoard = {
      id: Date.now(),
      name: boardData.name,
      user_id: 'demo-user',
      tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (onBoardCreate) {
      onBoardCreate(newBoardData);
    } else {
      setInternalBoards(prev => [...prev, newBoardData]);
      setSelectedBoard(newBoardData);
    }
    
    setShowCreateForm(false);
    setNewBoard({ name: '' });
  };

  const handleBoardSelect = (board: PriorityBoard) => {
    setSelectedBoard(board);
  };



  const handleTaskCreate = (taskData: Partial<Task>) => {
    if (onTaskCreate) {
      onTaskCreate(taskData);
    } else if (selectedBoard) {
      const newTask: Task = {
        id: Date.now(),
        title: taskData.title || 'New Quest',
        description: taskData.description || '',
        status: taskData.status || TaskStatus.PENDING,
        priority: taskData.priority || PriorityLevel.MEDIUM,
        due_date: taskData.due_date || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user',
        priority_board_id: selectedBoard.id,
        position: selectedBoard.tasks.length,
        reminder_enabled: taskData.reminder_enabled || false,
        reminder_type: taskData.reminder_type || ReminderType.EMAIL,
        reminder_sent: false,
        is_recurring: taskData.is_recurring || false,
        recurring_pattern: taskData.recurring_pattern || RecurringPattern.NONE
      };

      setInternalBoards(prev => prev.map(board => 
        board.id === selectedBoard.id 
          ? { ...board, tasks: [...board.tasks, newTask] }
          : board
      ));
      
      setSelectedBoard(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    } else if (selectedBoard) {
      setInternalBoards(prev => prev.map(board => 
        board.id === selectedBoard.id 
          ? { ...board, tasks: board.tasks.map(task => task.id === updatedTask.id ? updatedTask : task) }
          : board
      ));
      
      setSelectedBoard(prev => prev ? {
        ...prev, 
        tasks: prev.tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      } : null);
    }
  };

  const handleTaskDelete = (taskId: number) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    } else if (selectedBoard) {
      setInternalBoards(prev => prev.map(board => 
        board.id === selectedBoard.id 
          ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
          : board
      ));
      
      setSelectedBoard(prev => prev ? {
        ...prev, 
        tasks: prev.tasks.filter(task => task.id !== taskId)
      } : null);
    }
  };

  if (boards.length === 0) {
    return (
      <div className={`priority-boards ${theme}`}>
        <div className="boards-header">
          <h1 className="text-display text-primary">Priority Boards</h1>
          <p className="text-body-lg text-secondary">
            Organize your quests into focused mission boards!
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-illustration">
            <div className="empty-icon">📋</div>
          </div>
          <h4 className="text-h3 text-primary">No boards yet</h4>
          <p className="text-body text-secondary">
            Create your first priority board to start organizing your quests!
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Board
          </button>
        </div>

        {/* Create Board Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="text-h3 text-primary">Create New Board</h3>
                <button
                  className="btn-tertiary"
                  onClick={() => setShowCreateForm(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <form
                className="board-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateBoard(newBoard);
                }}
              >
                <div className="form-group">
                  <label htmlFor="board-name" className="form-label">Board Name</label>
                  <input
                    id="board-name"
                    type="text"
                    className="form-input"
                    value={newBoard.name}
                    onChange={(e) => setNewBoard(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Work Projects"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!newBoard.name.trim()}
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`priority-boards ${theme}`}>
      <div className="boards-header">
        <h1 className="text-display text-primary">Priority Boards</h1>
        <p className="text-body-lg text-secondary">
          Organize your quests into focused mission boards!
        </p>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Board
        </button>
      </div>

      <div className="boards-container">
        {/* Board Selection Sidebar */}
        <div className="boards-sidebar">
          <h3 className="text-h3 text-primary">Your Boards</h3>
          <div className="boards-list">
            {boards.map(board => (
              <div
                key={board.id}
                className={`board-item ${selectedBoard?.id === board.id ? 'active' : ''}`}
                onClick={() => handleBoardSelect(board)}
              >
                <div className="board-item-info">
                  <h4 className="text-h4 text-primary">{board.name}</h4>
                  <span className="task-count">{board.tasks.length} quests</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Board Content */}
        <div className="board-content">
          {selectedBoard ? (
            <PriorityBoardComponent
              priorityBoard={selectedBoard}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          ) : (
            <div className="no-board-selected">
              <div className="empty-illustration">
                <div className="empty-icon">📋</div>
              </div>
              <h4 className="text-h3 text-primary">Select a Board</h4>
              <p className="text-body text-secondary">
                Choose a board from the sidebar to view and manage its quests.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Board Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-h3 text-primary">Create New Board</h3>
              <button
                className="btn-tertiary"
                onClick={() => setShowCreateForm(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form
              className="board-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBoard(newBoard);
              }}
            >
              <div className="form-group">
                <label htmlFor="board-name" className="form-label">Board Name</label>
                <input
                  id="board-name"
                  type="text"
                  className="form-input"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Work Projects"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newBoard.name.trim()}
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityBoards;
