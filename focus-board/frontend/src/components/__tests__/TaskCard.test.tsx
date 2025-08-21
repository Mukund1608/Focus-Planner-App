import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskCard from '../TaskCard'
import { PriorityLevel, TaskStatus, ReminderType, RecurringPattern } from '../../types/task'

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  priority: PriorityLevel.HIGH,
  status: TaskStatus.PENDING,
  completed: false,
  due_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  reminder_enabled: false,
  reminder_type: ReminderType.NONE,
  is_recurring: false,
  recurring_pattern: RecurringPattern.NONE,
  position: 1,
  priority_board_id: 1
}

const mockProps = {
  task: mockTask,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusChange: vi.fn(),
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task title and description', () => {
    render(<TaskCard {...mockProps} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('displays correct priority badge', () => {
    render(<TaskCard {...mockProps} />)
    
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('shows due date when provided', () => {
    render(<TaskCard {...mockProps} />)
    
    expect(screen.getByText('Jan 01, 2024')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<TaskCard {...mockProps} />)
    
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskCard {...mockProps} />)
    
    const deleteButton = screen.getByTitle('Delete task')
    fireEvent.click(deleteButton)
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id)
  })

  it('calls onStatusChange when status is changed', () => {
    render(<TaskCard {...mockProps} />)
    
    const statusSelect = screen.getByRole('combobox')
    fireEvent.change(statusSelect, { target: { value: TaskStatus.COMPLETED } })
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith(mockTask.id, TaskStatus.COMPLETED)
  })

  it('shows completed state when task status is completed', () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED }
    render(<TaskCard {...mockProps} task={completedTask} />)
    
    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement
    expect(statusSelect.value).toBe(TaskStatus.COMPLETED)
  })

  it('applies completed styling when task is completed', () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED }
    render(<TaskCard {...mockProps} task={completedTask} />)
    
    const card = screen.getByText('Test Task').closest('.task-card')
    expect(card).toHaveClass('task-card')
  })
})
