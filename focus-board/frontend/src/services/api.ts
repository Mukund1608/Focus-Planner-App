import {
  Task,
  PriorityBoard,
  TaskCreate,
  TaskUpdate,
  PriorityBoardCreate,
  PriorityBoardUpdate,
  TaskReorderRequest,
  TaskBulkUpdateRequest,
  CreateRecurringTaskRequest,
  ReminderConfig,
  Habit,
  HabitCreate,
  HabitUpdate,
  HabitCompletion,
  HabitCompletionCreate,
  HabitStats
} from '../types/task';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making API call to: ${url}`, options);
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for SuperTokens session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log(`API response status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API error:', errorData);
    throw new Error(errorData.detail || `API call failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('API response data:', data);
  return data;
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

  // Date filtering methods for Daily and Weekly views
  getByDate: (date: string): Promise<Task[]> =>
    apiCall<Task[]>(`/tasks/by-date/${date}`),

  getByWeek: (startDate: string): Promise<Task[]> =>
    apiCall<Task[]>(`/tasks/by-week/${startDate}`),

  // Recurring task methods
  createRecurring: (data: CreateRecurringTaskRequest): Promise<Task> =>
    apiCall<Task>('/tasks/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRecurring: (): Promise<Task[]> =>
    apiCall<Task[]>('/tasks/recurring'),

  getTaskOccurrences: (parentTaskId: number): Promise<Task[]> =>
    apiCall<Task[]>(`/tasks/recurring/${parentTaskId}/occurrences`),

  processRecurring: (): Promise<{ message: string; created_tasks: Task[] }> =>
    apiCall<{ message: string; created_tasks: Task[] }>('/tasks/recurring/process', {
      method: 'POST',
    }),

  // Reminder methods
  getTasksWithReminders: (): Promise<Task[]> =>
    apiCall<Task[]>('/tasks/reminders'),

  getPendingReminders: (): Promise<Task[]> =>
    apiCall<Task[]>('/tasks/reminders/pending'),

  markReminderSent: (taskId: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/tasks/${taskId}/reminder/sent`, {
      method: 'POST',
    }),

  configureReminder: (taskId: number, config: ReminderConfig): Promise<{ message: string; task: Task }> =>
    apiCall<{ message: string; task: Task }>(`/tasks/${taskId}/reminder/configure`, {
      method: 'POST',
      body: JSON.stringify(config),
    }),
};

// Habit API calls
export const habitAPI = {
  create: (data: HabitCreate): Promise<Habit> =>
    apiCall<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (activeOnly: boolean = false): Promise<Habit[]> =>
    apiCall<Habit[]>(`/habits?active_only=${activeOnly}`),

  getById: (id: number): Promise<Habit> =>
    apiCall<Habit>(`/habits/${id}`),

  update: (id: number, data: HabitUpdate): Promise<Habit> =>
    apiCall<Habit>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/habits/${id}`, {
      method: 'DELETE',
    }),

  complete: (id: number, data: HabitCompletionCreate): Promise<HabitCompletion> =>
    apiCall<HabitCompletion>(`/habits/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCompletions: (id: number, days: number = 30): Promise<HabitCompletion[]> =>
    apiCall<HabitCompletion[]>(`/habits/${id}/completions?days=${days}`),

  getStats: (): Promise<HabitStats> =>
    apiCall<HabitStats>('/habits/stats'),
};

// Exam Mode API calls
import {
  ExamSchedule,
  ExamScheduleGenerateRequest,
  ExamScheduleGetResponse,
  ExamTaskCompletionRequest,
  NotificationPreferences,
  ExamPreferencesRequest
} from '../types/task';

export const examAPI = {
  // Generate or regenerate exam schedule
  generateSchedule: (data: ExamScheduleGenerateRequest): Promise<ExamSchedule> =>
    apiCall<ExamSchedule>('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get active exam schedule
  getSchedule: (day?: string): Promise<ExamScheduleGetResponse> => {
    const endpoint = day ? `/schedule/get?day=${day}` : '/schedule/get';
    return apiCall<ExamScheduleGetResponse>(endpoint);
  },

  // Complete/uncomplete a task
  completeTask: (data: ExamTaskCompletionRequest): Promise<{ message: string; taskId: string; completed: boolean }> =>
    apiCall<{ message: string; taskId: string; completed: boolean }>('/schedule/complete-task', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete exam schedule
  deleteSchedule: (): Promise<{ message: string }> =>
    apiCall<{ message: string }>('/schedule/delete', {
      method: 'DELETE',
    }),

  // Get notification preferences
  getNotificationPreferences: (): Promise<NotificationPreferences> =>
    apiCall<NotificationPreferences>('/schedule/preferences'),

  // Update notification preferences
  updateNotificationPreferences: (data: ExamPreferencesRequest): Promise<NotificationPreferences> =>
    apiCall<NotificationPreferences>('/schedule/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
