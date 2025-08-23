import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Task, PriorityBoard as PriorityBoardType, TaskStatus, TaskCreate } from '../types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './PriorityBoard.css';

interface PriorityBoardProps {
  priorityBoard: PriorityBoardType;
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskReorder: (taskId: number, newPosition: number, newPriorityBoardId?: number) => void;
  onCreateTask: (taskData: TaskCreate) => void;
  onPriorityBoardUpdate: (priorityBoardId: number, updates: Partial<PriorityBoardType>) => void;
  onPriorityBoardDelete: (priorityBoardId: number) => void;
}

const PriorityBoard: React.FC<PriorityBoardProps> = ({
  priorityBoard,
  onTaskUpdate,
  onTaskDelete,
  onTaskReorder,
  onCreateTask,
  onPriorityBoardUpdate,
  onPriorityBoardDelete
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [boardName, setBoardName] = useState(priorityBoard.name);

  // Remove the handleDragEnd function - it's handled by the parent component

  const handleCreateTask = (taskData: TaskCreate) => {
    onCreateTask(taskData);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskUpdate = (taskId: number, updates: Partial<Task>) => {
    onTaskUpdate(taskId, updates);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId: number) => {
    onTaskDelete(taskId);
  };

  const handleTaskStatusChange = (taskId: number, status: TaskStatus) => {
    onTaskUpdate(taskId, { status });
  };

  const handleNameEdit = () => {
    if (isEditingName && boardName.trim() !== priorityBoard.name) {
      onPriorityBoardUpdate(priorityBoard.id, { name: boardName.trim() });
    }
    setIsEditingName(!isEditingName);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameEdit();
    } else if (e.key === 'Escape') {
      setBoardName(priorityBoard.name);
      setIsEditingName(false);
    }
  };

  const sortedTasks = [...priorityBoard.tasks].sort((a, b) => {
    // Handle cases where position might be undefined
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });

  return (
    <div className="priority-board">
      <div className="priority-board-header">
        <div className="board-title">
          {isEditingName ? (
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleNameEdit}
              onKeyDown={handleNameKeyPress}
              className="board-name-input"
              autoFocus
            />
          ) : (
            <h3 onClick={() => setIsEditingName(true)} className="board-name">
              {priorityBoard.name}
            </h3>
          )}
          <span className="task-count">({sortedTasks.length})</span>
        </div>
        
        <div className="board-actions">
          <button 
            className="btn-edit-name" 
            onClick={handleNameEdit}
            title="Edit board name"
          >
            ✏️
          </button>
          <button 
            className="btn-delete-board" 
            onClick={() => onPriorityBoardDelete(priorityBoard.id)}
            title="Delete board"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="priority-board-content">
        <button 
          className="btn-add-task"
          onClick={() => setShowTaskForm(true)}
        >
          + Add Task
        </button>

        <Droppable droppableId={priorityBoard.id.toString()}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            >
                             {sortedTasks.map((task, index) => {
                 console.log(`Rendering draggable task: ${task.id} at index ${index}`);
                 return (
                   <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`draggable-task ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleTaskDelete}
                        onStatusChange={handleTaskStatusChange}
                      />
                    </div>
                                     )}
                 </Draggable>
               );
               })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <TaskForm
          priorityBoardId={priorityBoard.id}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Task Edit Form */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          priorityBoardId={priorityBoard.id}
          onSubmit={(updates) => handleTaskUpdate(editingTask.id, updates)}
          onCancel={() => setEditingTask(null)}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default PriorityBoard;
