import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import PriorityBoard from '../PriorityBoard'
import { PriorityBoard as PriorityBoardType, Task, TaskStatus, PriorityLevel } from '../../types/task'

// Mock TaskForm and TaskCard components
vi.mock('../TaskForm', () => ({
  default: ({ onSubmit, onCancel, priorityBoardId }: any) => (
    <div data-testid="task-form">
      <button onClick={() => onSubmit({ title: 'Test Task', priority: PriorityLevel.MEDIUM })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

vi.mock('../TaskCard', () => ({
  default: ({ task, onEdit, onDelete, onStatusChange }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={() => onEdit(task)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onStatusChange(task.id, TaskStatus.IN_PROGRESS)}>Status</button>
    </div>
  )
}))

const mockPriorityBoard: PriorityBoardType = {
  id: 1,
  name: 'Test Board',
  user_id: 'user123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tasks: [
    {
      id: 1,
      title: 'Test Task 1',
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
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Test Description 2',
      priority: PriorityLevel.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      due_date: '2024-01-02',
      user_id: 'user123',
      priority_board_id: 1,
      position: 2,
      reminder_enabled: false,
      reminder_type: 'none' as any,
      reminder_sent: false,
      is_recurring: false,
      recurring_pattern: 'none' as any,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
}

const emptyBoard: PriorityBoardType = {
  id: 1,
  name: 'Empty Board',
  user_id: 'user123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tasks: []
}

const mockProps = {
  priorityBoard: mockPriorityBoard,
  onTaskCreate: vi.fn(),
  onTaskUpdate: vi.fn(),
  onTaskDelete: vi.fn()
}

describe('PriorityBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders priority board with tasks', () => {
    render(<PriorityBoard {...mockProps} />)

    expect(screen.getByText('Test Board')).toBeInTheDocument()
    expect(screen.getByText('Priority board for organizing quests')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument()
  })

  it('renders empty state when no tasks', () => {
    render(<PriorityBoard {...mockProps} priorityBoard={emptyBoard} />)

    expect(screen.getByText('No quests yet')).toBeInTheDocument()
    expect(screen.getByText('Start your journey by creating your first quest!')).toBeInTheDocument()
  })

  it('shows task form when add task button is clicked', () => {
    render(<PriorityBoard {...mockProps} />)

    fireEvent.click(screen.getByText('+ Add Quest'))
    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })

  it('calls onTaskCreate when task form is submitted', () => {
    render(<PriorityBoard {...mockProps} />)

    fireEvent.click(screen.getByText('+ Add Quest'))
    fireEvent.click(screen.getByText('Submit'))

    expect(mockProps.onTaskCreate).toHaveBeenCalledWith({
      title: 'Test Task',
      priority: PriorityLevel.MEDIUM,
      priority_board_id: 1,
      status: TaskStatus.PENDING
    })
  })

  it('calls onTaskDelete when delete button is clicked', () => {
    render(<PriorityBoard {...mockProps} />)

    fireEvent.click(screen.getByText('Delete'))
    expect(mockProps.onTaskDelete).toHaveBeenCalledWith(1)
  })

  it('calls onTaskUpdate when edit button is clicked', () => {
    render(<PriorityBoard {...mockProps} />)

    fireEvent.click(screen.getByText('Edit'))
    expect(mockProps.onTaskUpdate).toHaveBeenCalledWith(mockPriorityBoard.tasks[0])
  })

  it('calls onTaskUpdate when status is changed', () => {
    render(<PriorityBoard {...mockProps} />)

    fireEvent.click(screen.getByText('Status'))
    expect(mockProps.onTaskUpdate).toHaveBeenCalledWith({
      ...mockPriorityBoard.tasks[0],
      status: TaskStatus.IN_PROGRESS
    })
  })
})
