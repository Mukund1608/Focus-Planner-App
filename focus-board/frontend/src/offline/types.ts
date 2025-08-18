export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface TaskRecord {
  id: string; // local uuid
  serverId?: number; // backend id
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  updatedAt: number; // epoch ms
  isDirty?: boolean; // needs sync
  isDeleted?: boolean; // soft delete for sync
}

export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id: string; // uuid for queue item
  taskId: string; // local id
  action: SyncActionType;
  payload?: Partial<TaskRecord>;
  enqueuedAt: number;
}
