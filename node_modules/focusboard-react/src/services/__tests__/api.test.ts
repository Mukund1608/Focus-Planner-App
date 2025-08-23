import { describe, it, expect, vi, beforeEach } from 'vitest'
import { taskAPI } from '../api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('fetches tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', priority: 'high' },
        { id: 2, title: 'Task 2', priority: 'medium' },
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      })

      const result = await taskAPI.getAll()

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      expect(result).toEqual(mockTasks)
    })

    it('handles fetch error', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(taskAPI.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('create', () => {
    it('creates task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        due_date: '2024-01-01',
      }

      const createdTask = { id: 3, ...newTask }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdTask,
      })

      const result = await taskAPI.create(newTask)

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newTask),
      })
      expect(result).toEqual(createdTask)
    })
  })

  describe('update', () => {
    it('updates task successfully', async () => {
      const taskId = 1
      const updates = { title: 'Updated Task' }

      const updatedTask = { id: taskId, ...updates }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask,
      })

      const result = await taskAPI.update(taskId, updates)

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
      expect(result).toEqual(updatedTask)
    })
  })

  describe('delete', () => {
    it('deletes task successfully', async () => {
      const taskId = 1

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Task deleted' }),
      })

      await taskAPI.delete(taskId)

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
    })
  })
})
