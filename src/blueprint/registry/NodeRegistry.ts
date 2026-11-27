export interface BlueprintPinDefinition {
  name: string;
  direction: 'input' | 'output';
  dataType: string;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
}

export interface BlueprintNodeDefinition {
  type: string;
  title: string;
  category: string;
  description: string;
  pins: readonly BlueprintPinDefinition[];
  defaultProperties?: Record<string, string | number | boolean | null>;
  operation?: string;
}

/** Central catalogue for node types available to the Blueprint editor. */
export class NodeRegistry {
  private readonly definitions = new Map<string, BlueprintNodeDefinition>();

  register(definition: BlueprintNodeDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Blueprint node type "${definition.type}" is already registered.`);
    }
    this.definitions.set(definition.type, definition);
  }

  get(type: string): BlueprintNodeDefinition | undefined {
    return this.definitions.get(type);
  }

  getAll(): BlueprintNodeDefinition[] {
    return [...this.definitions.values()];
  }

  search(query: string): BlueprintNodeDefinition[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.getAll();
    return this.getAll().filter((definition) =>
      [definition.title, definition.category, definition.description, definition.type]
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }
}
