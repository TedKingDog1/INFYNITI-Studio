import { CommandHistory, type Command } from '../core/history';

export type CommandFactory<TPayload = void> = (payload: TPayload) => Command;

/** Shared command routing and undo/redo service for every editor workspace. */
export class CommandBus extends CommandHistory {
  private readonly factories = new Map<string, CommandFactory<unknown>>();

  register<TPayload>(id: string, factory: CommandFactory<TPayload>): () => void {
    const key = id.trim();
    if (!key) throw new Error('A command must have a non-empty id.');
    if (this.factories.has(key)) throw new Error(`Command "${key}" is already registered.`);
    const registeredFactory = factory as CommandFactory<unknown>;
    this.factories.set(key, registeredFactory);
    return () => {
      if (this.factories.get(key) === registeredFactory) this.factories.delete(key);
    };
  }

  has(id: string): boolean { return this.factories.has(id); }

  dispatch(id: string): void;
  dispatch<TPayload>(id: string, payload: TPayload): void;
  dispatch<TPayload>(id: string, payload?: TPayload): void {
    const factory = this.factories.get(id);
    if (!factory) throw new Error(`Unknown editor command: "${id}".`);
    this.execute(factory(payload));
  }
}
