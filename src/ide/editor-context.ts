export interface EditorContextSnapshot {
  activeWorkspaceId: string;
  activeSceneId: string;
  selectedObjectIds: readonly string[];
}

export type EditorContextPatch = Partial<EditorContextSnapshot>;

/**
 * Shared, editor-facing state. This deliberately excludes authored project data
 * and live runtime state; it describes what the user is currently editing.
 */
export class EditorContext {
  private snapshot: EditorContextSnapshot;
  private readonly listeners = new Set<(state: EditorContextSnapshot) => void>();

  constructor(initial: EditorContextSnapshot) {
    this.snapshot = this.normalize(initial);
  }

  getState(): EditorContextSnapshot {
    return this.snapshot;
  }

  update(patch: EditorContextPatch): void {
    const next = this.normalize({ ...this.snapshot, ...patch });
    if (
      next.activeWorkspaceId === this.snapshot.activeWorkspaceId &&
      next.activeSceneId === this.snapshot.activeSceneId &&
      next.selectedObjectIds.length === this.snapshot.selectedObjectIds.length &&
      next.selectedObjectIds.every((id, index) => id === this.snapshot.selectedObjectIds[index])
    ) return;

    this.snapshot = next;
    for (const listener of this.listeners) listener(this.snapshot);
  }

  subscribe(listener: (state: EditorContextSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private normalize(state: EditorContextSnapshot): EditorContextSnapshot {
    return Object.freeze({
      activeWorkspaceId: state.activeWorkspaceId,
      activeSceneId: state.activeSceneId,
      selectedObjectIds: Object.freeze([...new Set(state.selectedObjectIds)]),
    });
  }
}
