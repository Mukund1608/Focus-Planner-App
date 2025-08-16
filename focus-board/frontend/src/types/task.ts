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
  priority: PriorityLevel;
  status: TaskStatus;
  due_date?: string;
  priority_board_id: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: PriorityLevel;
  status?: TaskStatus;
  due_date?: string;
  position?: number;
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
