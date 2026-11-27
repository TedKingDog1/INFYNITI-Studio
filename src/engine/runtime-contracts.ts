import type { StudioProject } from '../core/types';

export type RuntimeStatus = 'idle' | 'starting' | 'running' | 'paused' | 'stopping' | 'stopped' | 'error';

export interface RuntimeDiagnostic {
  severity: 'info' | 'warning' | 'error';
  message: string;
  sourceId?: string;
  timestamp: number;
}

export interface RuntimeSnapshot {
  projectId: string;
  status: RuntimeStatus;
  startedAt: number | null;
  diagnostics: readonly RuntimeDiagnostic[];
}

/** Runtime implementations receive an immutable project snapshot, never editor-owned live state. */
export interface RuntimeSession {
  getSnapshot(): RuntimeSnapshot;
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  subscribe(listener: (snapshot: RuntimeSnapshot) => void): () => void;
  dispose(): void;
}

export interface RuntimeSessionFactory {
  create(project: Readonly<StudioProject>): RuntimeSession;
}
