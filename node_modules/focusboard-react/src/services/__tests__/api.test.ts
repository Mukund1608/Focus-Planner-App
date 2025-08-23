import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskAPI } from '../api';
import { PriorityLevel, TaskStatus } from '../../types/task';

// Mock fetch globally
const mockFetch = vi.fn();
// global.fetch is already mocked in setup.ts
if (typeof global !== 'undefined') {
  (global as any).fetch = mockFetch;
}

describe('taskAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all tasks successfully', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          priority: PriorityLevel.HIGH,
          status: 'pending',
          due_date: '2024-01-01',
          user_id: 'user123',
          priority_board_id: 1,
          position: 1,
          reminder_enabled: false,
          reminder_type: 'none',
          reminder_sent: false,
          is_recurring: false,
          recurring_pattern: 'none',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      });

      const result = await taskAPI.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(result).toEqual(mockTasks);
    });

    it('should handle errors when fetching tasks', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(taskAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: PriorityLevel.HIGH,
        due_date: '2024-01-01'
      };

      const createdTask = {
        id: 1,
        ...newTask,
        status: 'pending',
        user_id: 'user123',
        priority_board_id: 1,
        position: 1,
        reminder_enabled: false,
        reminder_type: 'none',
        reminder_sent: false,
        is_recurring: false,
        recurring_pattern: 'none',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdTask
      });

      const result = await taskAPI.create(newTask);

      expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = 1;
      const updates = {
        title: 'Updated Task',
        status: 'completed'
      };

      const updatedTask = {
        id: taskId,
        title: 'Updated Task',
        description: 'Test Description',
        priority: PriorityLevel.HIGH,
        status: 'completed',
        due_date: '2024-01-01',
        user_id: 'user123',
        priority_board_id: 1,
        position: 1,
        reminder_enabled: false,
        reminder_type: 'none',
        reminder_sent: false,
        is_recurring: false,
        recurring_pattern: 'none',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask
      });

      const result = await taskAPI.update(taskId, { ...updates, status: TaskStatus.IN_PROGRESS });

      expect(mockFetch).toHaveBeenCalledWith(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      expect(result).toEqual(updatedTask);
    });
  });

  describe('delete', () => {
    it('should delete a task successfully', async () => {
      const taskId = 1;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Task deleted successfully' })
      });

      await taskAPI.delete(taskId);

      expect(mockFetch).toHaveBeenCalledWith(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });
});
