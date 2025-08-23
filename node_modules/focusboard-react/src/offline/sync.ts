import { getQueue, dequeue, getTask, putTask, getAllTasks } from './db';
import { SyncQueueItem, TaskRecord } from './types';
import { getApiDomain } from '../config';

type ServerTask = {
  id: number;
  title: string;
  description?: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed';
  updated_at?: string; // ISO
};

function toLocal(server: ServerTask): TaskRecord {
  return {
    id: `server-${server.id}`,
    serverId: server.id,
    title: server.title,
    description: server.description ?? '',
    priority: server.priority,
    status: server.status,
    updatedAt: server.updated_at ? Date.parse(server.updated_at) : Date.now(),
    isDirty: false,
  };
}

async function fetchServerTasks(): Promise<ServerTask[]> {
  const api = getApiDomain();
  const res = await fetch(`${api}/api/tasks`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch server tasks');
  return res.json();
}

async function applyToServer(item: SyncQueueItem, localTask: TaskRecord | undefined): Promise<TaskRecord | null> {
  const api = getApiDomain();
  if (item.action === 'CREATE' && localTask) {
    const res = await fetch(`${api}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: localTask.title,
        description: localTask.description ?? '',
        priority: localTask.priority,
        status: localTask.status,
        updated_at: new Date(localTask.updatedAt).toISOString(),
      }),
    });
    if (!res.ok) throw new Error('CREATE failed');
    const server: ServerTask = await res.json();
    const updated: TaskRecord = { ...localTask, serverId: server.id, isDirty: false };
    await putTask(updated);
    return updated;
  }

  if (item.action === 'UPDATE' && localTask && localTask.serverId != null) {
    const res = await fetch(`${api}/api/tasks/${localTask.serverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: localTask.title,
        description: localTask.description ?? '',
        priority: localTask.priority,
        status: localTask.status,
        updated_at: new Date(localTask.updatedAt).toISOString(),
      }),
    });
    if (!res.ok) throw new Error('UPDATE failed');
    const _server: ServerTask = await res.json();
    const updated: TaskRecord = { ...localTask, isDirty: false };
    await putTask(updated);
    return updated;
  }

  if (item.action === 'DELETE') {
    if (localTask?.serverId != null) {
      const res = await fetch(`${api}/api/tasks/${localTask.serverId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('DELETE failed');
    }
    return null;
  }

  return null;
}

async function reconcileLocalWithServer(serverTasks: ServerTask[]) {
  const serverById = new Map<number, ServerTask>();
  serverTasks.forEach((t) => serverById.set(t.id, t));

  const localTasks = await getAllTasks();

  // Merge server -> local
  for (const st of serverTasks) {
    const local = localTasks.find((lt) => lt.serverId === st.id);
    const serverLocal = toLocal(st);
    if (!local) {
      // Insert server task locally
      await putTask(serverLocal);
      continue;
    }
    // Last-write-wins
    if ((local.isDirty ?? false) && local.updatedAt >= serverLocal.updatedAt) {
      // keep local (will sync via queue)
      continue;
    }
    if (serverLocal.updatedAt >= local.updatedAt) {
      await putTask({ ...serverLocal, id: local.id });
    }
  }

  // Local tasks pointing to serverId that no longer exist on server
  for (const local of localTasks) {
    if (local.serverId != null && !serverById.has(local.serverId)) {
      if (!(local.isDirty ?? false)) {
        // Server deleted and we have no local edits -> remove locally
        // Optional: implement a local tombstone. For now, delete.
        // Reuse putTask/deleteTask? We don't have deleteTask imported here; only used in DB module by other code.
        // Do nothing to avoid data loss; could mark as dirty delete instead.
        // Leave as-is to let user resolve.
      }
    }
  }
}

export async function runSyncIfOnline() {
  if (!navigator.onLine) return;
  // First, push local queue to server
  const queue = await getQueue();
  for (const item of queue) {
    try {
      const localTask = await getTask(item.taskId);
      await applyToServer(item, localTask);
      await dequeue(item.id);
    } catch (_e) {
      break;
    }
  }

  // Then, pull server state and reconcile
  try {
    const serverTasks = await fetchServerTasks();
    await reconcileLocalWithServer(serverTasks);
  } catch (_e) {
    // Ignore pull errors
  }
}
