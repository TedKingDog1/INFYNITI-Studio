export interface WorkspaceDefinition {
  id: string;
  label: string;
  description: string;
  /** Optional icon key interpreted by the host UI. */
  icon?: string;
}

export class WorkspaceRegistry {
  private readonly definitions = new Map<string, WorkspaceDefinition>();

  register(definition: WorkspaceDefinition): void {
    const id = definition.id.trim();
    if (!id) throw new Error('A workspace must have a non-empty id.');
    if (!definition.label.trim()) throw new Error(`Workspace "${id}" must have a label.`);
    if (this.definitions.has(id)) throw new Error(`Workspace "${id}" is already registered.`);
    this.definitions.set(id, Object.freeze({ ...definition, id }));
  }

  get(id: string): WorkspaceDefinition | undefined {
    return this.definitions.get(id);
  }

  list(): WorkspaceDefinition[] {
    return [...this.definitions.values()];
  }

  has(id: string): boolean {
    return this.definitions.has(id);
  }
}
