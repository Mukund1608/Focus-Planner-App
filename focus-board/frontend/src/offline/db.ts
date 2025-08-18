import { openDB, IDBPDatabase } from 'idb';
import { TaskRecord, SyncQueueItem } from './types';

const DB_NAME = 'focusboard-db';
const DB_VERSION = 1;

export interface FocusBoardDB extends IDBPDatabase<unknown> {}

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        const store = db.createObjectStore('tasks', { keyPath: 'id' });
        store.createIndex('by_updatedAt', 'updatedAt');
        store.createIndex('by_status', 'status');
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('by_enqueuedAt', 'enqueuedAt');
      }
    },
  });
}

export async function putTask(task: TaskRecord) {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function getTask(id: string): Promise<TaskRecord | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function getAllTasks(): Promise<TaskRecord[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function deleteTask(id: string) {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function enqueue(item: SyncQueueItem) {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function getQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function dequeue(id: string) {
  const db = await getDB();
  await db.delete('syncQueue', id);
}
