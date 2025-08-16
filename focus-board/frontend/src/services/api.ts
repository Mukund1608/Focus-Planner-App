import { 
  Task, 
  PriorityBoard, 
  TaskCreate, 
  TaskUpdate, 
  PriorityBoardCreate, 
  PriorityBoardUpdate,
  TaskReorderRequest,
  TaskBulkUpdateRequest
} from '../types/task';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies for SuperTokens session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API call failed: ${response.status}`);
  }

  return response.json();
}

// Priority Board API calls
export const priorityBoardAPI = {
  create: (data: PriorityBoardCreate): Promise<PriorityBoard> =>
    apiCall<PriorityBoard>('/priority-boards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (): Promise<PriorityBoard[]> =>
    apiCall<PriorityBoard[]>('/priority-boards'),

  getById: (id: number): Promise<PriorityBoard> =>
    apiCall<PriorityBoard>(`/priority-boards/${id}`),

  update: (id: number, data: PriorityBoardUpdate): Promise<PriorityBoard> =>
    apiCall<PriorityBoard>(`/priority-boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/priority-boards/${id}`, {
      method: 'DELETE',
    }),
};

// Task API calls
export const taskAPI = {
  create: (data: TaskCreate): Promise<Task> =>
    apiCall<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (): Promise<Task[]> =>
    apiCall<Task[]>('/tasks'),

  getByPriorityBoard: (priorityBoardId: number): Promise<Task[]> =>
    apiCall<Task[]>(`/tasks/priority-board/${priorityBoardId}`),

  getById: (id: number): Promise<Task> =>
    apiCall<Task>(`/tasks/${id}`),

  update: (id: number, data: TaskUpdate): Promise<Task> =>
    apiCall<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  reorder: (id: number, data: TaskReorderRequest): Promise<{ message: string; task: Task }> =>
    apiCall<{ message: string; task: Task }>(`/tasks/${id}/reorder`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkUpdate: (data: TaskBulkUpdateRequest): Promise<{ message: string }> =>
    apiCall<{ message: string }>('/tasks/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
