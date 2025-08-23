import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task, PriorityBoard, TaskCreate, TaskUpdate, TaskStatus } from '../types/task';
import { priorityBoardAPI, taskAPI } from '../services/api';
import PriorityBoardComponent from './PriorityBoard';
import './PriorityBoards.css';

const PriorityBoards: React.FC = () => {
  const [priorityBoards, setPriorityBoards] = useState<PriorityBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  // Load priority boards and tasks on component mount
  useEffect(() => {
    loadPriorityBoards();
  }, []);

  const loadPriorityBoards = async () => {
    try {
      setLoading(true);
      const boards = await priorityBoardAPI.getAll();
      console.log('📋 Loaded priority boards:', boards);
      setPriorityBoards(boards);
      setError(null);
    } catch (err) {
      setError('Failed to load priority boards');
      console.error('Error loading priority boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePriorityBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const newBoard = await priorityBoardAPI.create({ name: newBoardName.trim() });
      setPriorityBoards(prev => [...prev, newBoard]);
      setNewBoardName('');
      setShowCreateBoard(false);
    } catch (err) {
      setError('Failed to create priority board');
      console.error('Error creating priority board:', err);
    }
  };

  const handleUpdatePriorityBoard = async (boardId: number, updates: Partial<PriorityBoard>) => {
    try {
      const updatedBoard = await priorityBoardAPI.update(boardId, updates);
      setPriorityBoards(prev => 
        prev.map(board => 
          board.id === boardId ? { ...board, ...updatedBoard } : board
        )
      );
    } catch (err) {
      setError('Failed to update priority board');
      console.error('Error updating priority board:', err);
    }
  };

  const handleDeletePriorityBoard = async (boardId: number) => {
    if (!window.confirm('Are you sure you want to delete this priority board? All tasks will be deleted.')) {
      return;
    }

    try {
      await priorityBoardAPI.delete(boardId);
      setPriorityBoards(prev => prev.filter(board => board.id !== boardId));
    } catch (err) {
      setError('Failed to delete priority board');
      console.error('Error deleting priority board:', err);
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await taskAPI.create(taskData);
      setPriorityBoards(prev => 
        prev.map(board => 
          board.id === taskData.priority_board_id 
            ? { ...board, tasks: [...board.tasks, newTask] }
            : board
        )
      );
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: TaskUpdate) => {
    try {
      const updatedTask = await taskAPI.update(taskId, updates);
      setPriorityBoards(prev => 
        prev.map(board => ({
          ...board,
          tasks: board.tasks.map(task => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        }))
      );
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.delete(taskId);
      setPriorityBoards(prev => 
        prev.map(board => ({
          ...board,
          tasks: board.tasks.filter(task => task.id !== taskId)
        }))
      );
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('🎯 DRAG END TRIGGERED!');
    console.log('Main drag end result:', result);
    
    if (!result.destination) {
      console.log('No destination in main handler');
      return;
    }

    const { draggableId, destination, source } = result;
    const taskId = parseInt(draggableId);
    const sourceBoardId = parseInt(source.droppableId);
    const destBoardId = parseInt(destination.droppableId);
    
    console.log('Main handler - Task ID:', taskId, 'Source Board:', sourceBoardId, 'Dest Board:', destBoardId);

    try {
      // Optimistically update the UI
      const updatedBoards = [...priorityBoards];
      const sourceBoard = updatedBoards.find(board => board.id === sourceBoardId);
      const destBoard = updatedBoards.find(board => board.id === destBoardId);

      if (!sourceBoard || !destBoard) return;

      const task = sourceBoard.tasks.find(t => t.id === taskId);
      if (!task) return;

      // Remove task from source board
      sourceBoard.tasks = sourceBoard.tasks.filter(t => t.id !== taskId);
      
      // Add task to destination board at the new position
      const updatedTask = { ...task, priority_board_id: destBoardId, position: destination.index };
      destBoard.tasks.splice(destination.index, 0, updatedTask);

      // Update positions for all tasks in both boards
      sourceBoard.tasks.forEach((t, index) => {
        t.position = index;
      });
      destBoard.tasks.forEach((t, index) => {
        t.position = index;
      });

      setPriorityBoards(updatedBoards);

      // Send update to backend
      console.log('Sending reorder request to backend:', {
        task_id: taskId,
        new_position: destination.index,
        new_priority_board_id: destBoardId
      });
      
      await taskAPI.reorder(taskId, {
        task_id: taskId,
        new_position: destination.index,
        new_priority_board_id: destBoardId
      });
      
      console.log('Reorder request successful');
    } catch (err) {
      setError('Failed to reorder task');
      console.error('Error reordering task:', err);
      // Reload boards to restore original state
      loadPriorityBoards();
    }
  };

  if (loading) {
    return (
      <div className="priority-boards-container">
        <div className="loading">Loading priority boards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="priority-boards-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadPriorityBoards} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="priority-boards-container">
      <div className="priority-boards-header">
        <h1>Priority Boards</h1>
        <button 
          className="btn-create-board"
          onClick={() => setShowCreateBoard(true)}
        >
          + Create Board
        </button>
      </div>

      {/* Create Board Form */}
      {showCreateBoard && (
        <div className="create-board-form">
          <input
            type="text"
            placeholder="Enter board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePriorityBoard()}
            className="board-name-input"
            autoFocus
          />
          <div className="form-actions">
            <button 
              onClick={() => setShowCreateBoard(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreatePriorityBoard}
              className="btn-primary"
              disabled={!newBoardName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Priority Boards Grid */}
      <DragDropContext 
        onDragStart={() => console.log('🚀 DRAG STARTED!')}
        onDragEnd={handleDragEnd}
      >
        <div className="priority-boards-grid">
          {priorityBoards.map(board => (
            <PriorityBoardComponent
              key={board.id}
              priorityBoard={board}
              onTaskUpdate={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
              onTaskReorder={(taskId, newPosition, newBoardId) => {
                // This is handled by the drag and drop context
              }}
              onCreateTask={handleCreateTask}
              onPriorityBoardUpdate={handleUpdatePriorityBoard}
              onPriorityBoardDelete={handleDeletePriorityBoard}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {priorityBoards.length === 0 && !showCreateBoard && (
        <div className="empty-state">
          <h2>No Priority Boards Yet</h2>
          <p>Create your first priority board to start organizing your tasks!</p>
          <button 
            onClick={() => setShowCreateBoard(true)}
            className="btn-primary"
          >
            Create Your First Board
          </button>
        </div>
      )}
    </div>
  );
};

export default PriorityBoards;
