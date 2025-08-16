import React, { useState } from 'react';
import { TaskCreate, PriorityLevel, TaskStatus } from '../types/task';
import { taskAPI } from '../services/api';
import { format } from 'date-fns';
import './TestTaskCreator.css';

const TestTaskCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [priorityBoardId, setPriorityBoardId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const taskData: TaskCreate = {
        title,
        description: description || undefined,
        priority,
        status: TaskStatus.PENDING,
        due_date: dueDate,
        priority_board_id: priorityBoardId
      };

      await taskAPI.create(taskData);
      setMessage('Task created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(PriorityLevel.MEDIUM);
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (err) {
      setMessage('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-task-creator">
      <h3>Create Test Task</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div>
          <label>Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)}>
            <option value={PriorityLevel.URGENT}>Urgent</option>
            <option value={PriorityLevel.HIGH}>High</option>
            <option value={PriorityLevel.MEDIUM}>Medium</option>
            <option value={PriorityLevel.LOW}>Low</option>
          </select>
        </div>
        
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Priority Board ID:</label>
          <input
            type="number"
            value={priorityBoardId}
            onChange={(e) => setPriorityBoardId(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      
      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestTaskCreator;
