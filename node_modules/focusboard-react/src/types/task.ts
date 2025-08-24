export enum PriorityLevel {
  URGENT = "urgent",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export enum RecurringPattern {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom"
}

export enum ReminderType {
  NONE = "none",
  EMAIL = "email",
  BROWSER = "browser",
  BOTH = "both"
}

export enum HabitFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom"
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  due_date?: string;
  user_id: string;
  priority_board_id: number;
  position: number;
  
  // Reminder fields
  reminder_enabled: boolean;
  reminder_time?: string;
  reminder_type: ReminderType;
  reminder_sent: boolean;
  reminder_advance?: string;
  
  // Recurring task fields
  is_recurring: boolean;
  recurring_pattern: RecurringPattern;
  recurring_config?: Record<string, any>;
  parent_task_id?: number;
  next_occurrence?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PriorityBoard {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: PriorityLevel;
  status?: TaskStatus;
  due_date?: string;
  priority_board_id?: number;
  
  // Reminder fields
  reminder_enabled?: boolean;
  reminder_type?: ReminderType;
  reminder_advance?: string;
  
  // Recurring task fields
  is_recurring?: boolean;
  recurring_pattern?: RecurringPattern;
  recurring_config?: Record<string, any>;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  status?: TaskStatus;
  due_date?: string;
  
  // Reminder fields
  reminder_enabled?: boolean;
  reminder_type?: ReminderType;
  reminder_advance?: string;
  
  // Recurring task fields
  is_recurring?: boolean;
  recurring_pattern?: RecurringPattern;
  recurring_config?: Record<string, any>;
}

export interface PriorityBoardCreate {
  name: string;
}

export interface PriorityBoardUpdate {
  name?: string;
}

export interface TaskReorderRequest {
  task_id: number;
  new_position: number;
  new_priority_board_id?: number;
}

export interface TaskBulkUpdateRequest {
  task_ids: number[];
  updates: TaskUpdate;
}

// New interfaces for recurring tasks and reminders
export interface RecurringConfig {
  interval: number;
  weekdays?: number[];
  end_date?: string;
  max_occurrences?: number;
}

export interface ReminderConfig {
  enabled: boolean;
  time?: string;
  type: ReminderType;
  advance_minutes: number;
}

export interface CreateRecurringTaskRequest {
  base_task: TaskCreate;
  recurring_config: RecurringConfig;
}

export interface UpdateRecurringTaskRequest {
  task_id: number;
  updates: TaskUpdate;
  recurring_config?: RecurringConfig;
}

// Habit interfaces
export interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  target_count: number;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  user_id: string;
  is_active: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  completed_at: string;
  notes?: string;
  created_at: string;
}

export interface HabitCreate {
  title: string;
  description?: string;
  frequency: HabitFrequency;
  target_count: number;
  color: string;
  icon: string;
}

export interface HabitUpdate {
  title?: string;
  description?: string;
  frequency?: HabitFrequency;
  target_count?: number;
  is_active?: boolean;
  color?: string;
  icon?: string;
}

export interface HabitCompletionCreate {
  notes?: string;
}

export interface HabitStats {
  total_habits: number;
  active_habits: number;
  total_completions_today: number;
  total_completions_this_week: number;
  total_completions_this_month: number;
  average_streak: number;
  longest_current_streak: number;
}

// Exam Mode Types
export enum ExamDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export interface ExamSubject {
  id: string;
  name: string;
  examDate: string; // ISO date string
  difficulty: ExamDifficulty;
  weightOverride?: number; // Optional weight multiplier (0.5-3.0)
}

export interface ExamInputs {
  subjects: ExamSubject[];
  dailyHours: number;
  startDate?: string; // ISO date string, defaults to today
  reserveRevision?: boolean; // Whether to reserve revision days
  blockMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  longBreakEveryNBlocks?: number;
}

export interface ExamTask {
  id: string;
  subjectId: string;
  subjectName: string;
  difficulty: ExamDifficulty;
  plannedMinutes: number;
  pomodoroBlocks: number;
  completedAt?: string; // ISO timestamp
  notes?: string;
}

export interface ExamScheduleDay {
  day: string; // ISO date string
  totalPlannedMinutes: number;
  tasks: ExamTask[];
}

export interface ExamSchedule {
  scheduleId: string;
  version: number;
  fromDate: string;
  toDate: string;
  days: ExamScheduleDay[];
  params: ExamInputs; // Snapshot of inputs used to generate
}

export interface NotificationPreferences {
  amEnabled: boolean;
  amTime: string; // HH:mm format
  pmEnabled: boolean;
  pmTime: string; // HH:mm format
  tz: string; // Timezone string
}

export interface ExamScheduleResponse {
  scheduleId: string;
  version: number;
  fromDate: string;
  toDate: string;
  days: ExamScheduleDay[];
}

export interface ExamTaskCompletionRequest {
  taskId: string;
  completed: boolean;
}

export interface ExamScheduleGenerateRequest {
  subjects: ExamSubject[];
  dailyHours: number;
  startDate?: string;
  reserveRevision?: boolean;
  blockMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  longBreakEveryNBlocks?: number;
}

export interface ExamScheduleGetResponse {
  day?: string;
  tasks?: ExamTask[];
  schedule?: ExamScheduleResponse;
}

export interface ExamPreferencesRequest {
  amEnabled?: boolean;
  amTime?: string;
  pmEnabled?: boolean;
  pmTime?: string;
  tz?: string;
}
