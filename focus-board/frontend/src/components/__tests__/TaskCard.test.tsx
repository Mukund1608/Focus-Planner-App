import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TaskCard from '../TaskCard'
import { Task, TaskStatus, PriorityLevel } from '../../types/task'

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  priority: PriorityLevel.HIGH,
  status: TaskStatus.PENDING,
  due_date: '2024-01-01',
  user_id: 'user123',
  priority_board_id: 1,
  position: 1,
  reminder_enabled: false,
  reminder_type: 'none' as any,
  reminder_sent: false,
  is_recurring: false,
  recurring_pattern: 'none' as any,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockProps = {
  task: mockTask,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusChange: vi.fn()
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    render(<TaskCard {...mockProps} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Boss Task')).toBeInTheDocument()
  })

  it('shows correct priority badge', () => {
    render(<TaskCard {...mockProps} />)

    expect(screen.getByText('Boss Task')).toBeInTheDocument()
  })

  it('shows medium priority badge', () => {
    const mediumTask = { ...mockTask, priority: PriorityLevel.MEDIUM }
    render(<TaskCard {...mockProps} task={mediumTask} />)

    expect(screen.getByText('Milestone')).toBeInTheDocument()
  })

  it('shows low priority badge', () => {
    const lowTask = { ...mockTask, priority: PriorityLevel.LOW }
    render(<TaskCard {...mockProps} task={lowTask} />)

    expect(screen.getByText('Daily')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<TaskCard {...mockProps} />)

    fireEvent.click(screen.getByLabelText('Edit quest'))
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskCard {...mockProps} />)

    fireEvent.click(screen.getByLabelText('Delete quest'))
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id)
  })

  it('calls onStatusChange when status is changed', () => {
    render(<TaskCard {...mockProps} />)

    fireEvent.click(screen.getByLabelText('Start quest'))
    expect(mockProps.onStatusChange).toHaveBeenCalledWith(mockTask.id, TaskStatus.IN_PROGRESS)
  })

  it('shows completed task with different styling', () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED }
    render(<TaskCard {...mockProps} task={completedTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument()
  })

  it('shows in-progress task with different styling', () => {
    const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS }
    render(<TaskCard {...mockProps} task={inProgressTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Complete quest')).toBeInTheDocument()
  })
})
