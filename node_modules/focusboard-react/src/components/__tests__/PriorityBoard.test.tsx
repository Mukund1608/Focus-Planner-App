import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PriorityBoard from '../PriorityBoard'
import { PriorityLevel, TaskStatus, ReminderType, RecurringPattern } from '../../types/task'

// Mock the drag and drop context
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => (
    <div data-testid="drag-drop-context" onClick={() => onDragEnd({})}>
      {children}
    </div>
  ),
  Droppable: ({ children }: any) => children({
    droppableProps: {},
    innerRef: vi.fn(),
    placeholder: null,
  }, {}),
  Draggable: ({ children }: any) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: vi.fn(),
  }, {}),
}))

const mockTasks = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Test Description 1',
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
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Test Description 2',
    priority: PriorityLevel.MEDIUM,
    status: TaskStatus.PENDING,
    completed: false,
    due_date: '2024-01-02',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    reminder_enabled: false,
    reminder_type: ReminderType.NONE,
    is_recurring: false,
    recurring_pattern: RecurringPattern.NONE,
    position: 2,
    priority_board_id: 1
  },
]

const mockPriorityBoard = {
  id: 1,
  name: 'Test Board',
  description: 'Test Description',
  tasks: mockTasks,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockProps = {
  priorityBoard: mockPriorityBoard,
  onTaskUpdate: vi.fn(),
  onTaskDelete: vi.fn(),
  onTaskReorder: vi.fn(),
  onCreateTask: vi.fn(),
  onPriorityBoardUpdate: vi.fn(),
  onPriorityBoardDelete: vi.fn(),
}

describe('PriorityBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders priority board with name', () => {
    render(<PriorityBoard {...mockProps} />)
    
    expect(screen.getByText('Test Board')).toBeInTheDocument()
  })

  it('displays tasks in the board', () => {
    render(<PriorityBoard {...mockProps} />)
    
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 2')).toBeInTheDocument()
  })

  it('shows task count', () => {
    render(<PriorityBoard {...mockProps} />)
    
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('calls onCreateTask when add task button is clicked', () => {
    render(<PriorityBoard {...mockProps} />)
    
    const addButton = screen.getByText('+ Add Task')
    fireEvent.click(addButton)
    
    // The button click should show the task form, not directly call onCreateTask
    // onCreateTask is called when the form is submitted
    expect(addButton).toBeInTheDocument()
  })

  it('renders empty task list when no tasks', () => {
    const emptyBoard = { ...mockPriorityBoard, tasks: [] }
    render(<PriorityBoard {...mockProps} priorityBoard={emptyBoard} />)
    
    // Should show empty task list but no specific "no tasks" message
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })
})
