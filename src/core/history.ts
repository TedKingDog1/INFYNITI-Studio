export interface Command {
  label: string;
  execute(): void;
  undo(): void;
}

export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private listeners = new Set<() => void>();

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.emit();
  }

  recordExecuted(command: Command): void {
    this.undoStack.push(command);
    this.redoStack = [];
    this.emit();
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
    this.emit();
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
    this.emit();
  }

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }
  clear(): void { this.undoStack = []; this.redoStack = []; this.emit(); }
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private emit(): void { this.listeners.forEach((listener) => listener()); }
}
