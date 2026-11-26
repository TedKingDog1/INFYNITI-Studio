import type { StudioProject } from './types';

export interface ProjectStorage {
  list(): Promise<Array<Pick<StudioProject, 'id' | 'name' | 'updatedAt'>>>;
  get(id: string): Promise<StudioProject | undefined>;
  put(project: StudioProject): Promise<void>;
  delete(id: string): Promise<void>;
}

export class IndexedDbProjectStorage implements ProjectStorage {
  private database?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB is unavailable in this browser.'));
    if (!this.database) this.database = new Promise((resolve, reject) => {
      const request = indexedDB.open('blacksite-studio', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Could not open project storage.'));
    });
    return this.database;
  }

  async list(): Promise<Array<Pick<StudioProject, 'id' | 'name' | 'updatedAt'>>> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('projects', 'readonly').objectStore('projects').getAll();
      request.onsuccess = () => resolve((request.result as StudioProject[]).map(({ id, name, updatedAt }) => ({ id, name, updatedAt })));
      request.onerror = () => reject(request.error);
    });
  }

  async get(id: string): Promise<StudioProject | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('projects', 'readonly').objectStore('projects').get(id);
      request.onsuccess = () => resolve(request.result as StudioProject | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async put(project: StudioProject): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('projects', 'readwrite').objectStore('projects').put(project);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('projects', 'readwrite').objectStore('projects').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
