import type { BlueprintGraph, BlueprintNode, BlueprintPin, JsonValue } from '../../domain/project-model';
import type { NodeRegistry } from '../registry/NodeRegistry';

export type BlueprintRuntimeValue = string | number | boolean | null;

export interface BlueprintEvaluationResult {
  values: Record<string, BlueprintRuntimeValue>;
  issues: string[];
}

/**
 * Evaluates pure data nodes without executing gameplay or arbitrary user code.
 * Results are keyed by output-pin ID so the editor can preview connected values.
 */
export function evaluateBlueprintGraph(graph: BlueprintGraph, registry: NodeRegistry): BlueprintEvaluationResult {
  const values: Record<string, BlueprintRuntimeValue> = {};
  const issues: string[] = [];
  const pins = new Map<string, { node: BlueprintNode; pin: BlueprintPin }>();
  const incoming = new Map<string, string>();

  for (const node of graph.nodes) {
    for (const pin of node.pins) pins.set(pin.id, { node, pin });
  }
  for (const link of graph.links) incoming.set(link.targetPinId, link.sourcePinId);

  const cache = new Map<string, BlueprintRuntimeValue>();
  const issueSet = new Set<string>();

  const report = (message: string): void => {
    if (!issueSet.has(message)) {
      issueSet.add(message);
      issues.push(message);
    }
  };

  const primitive = (value: JsonValue | undefined): BlueprintRuntimeValue =>
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null
      ? value
      : null;

  const inputValue = (node: BlueprintNode, name: string, stack: Set<string>): BlueprintRuntimeValue => {
    const pin = node.pins.find((candidate) => candidate.direction === 'input' && candidate.name === name);
    if (!pin) {
      report(node.title + ': missing input "' + name + '".');
      return null;
    }
    const sourcePinId = incoming.get(pin.id);
    if (sourcePinId) return outputValue(sourcePinId, stack);
    return primitive(pin.defaultValue);
  };

  const numberInput = (node: BlueprintNode, name: string, stack: Set<string>): number | null => {
    const value = inputValue(node, name, stack);
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      report(node.title + ': input "' + name + '" needs a finite number.');
      return null;
    }
    return value;
  };

  const booleanInput = (node: BlueprintNode, name: string, stack: Set<string>): boolean | null => {
    const value = inputValue(node, name, stack);
    if (typeof value !== 'boolean') {
      report(node.title + ': input "' + name + '" needs a Boolean value.');
      return null;
    }
    return value;
  };

  const outputValue = (pinId: string, stack: Set<string>): BlueprintRuntimeValue => {
    if (cache.has(pinId)) return cache.get(pinId)!;
    const endpoint = pins.get(pinId);
    if (!endpoint || endpoint.pin.direction !== 'output') {
      report('A data connection references a missing output pin.');
      return null;
    }
    if (stack.has(pinId)) {
      report('A circular data dependency was detected.');
      return null;
    }

    const { node, pin } = endpoint;
    const definition = registry.get(node.type);
    if (!definition) {
      report('Unknown node type "' + node.type + '".');
      return null;
    }

    const nextStack = new Set(stack);
    nextStack.add(pinId);
    let result: BlueprintRuntimeValue = null;

    switch (definition.operation) {
      case 'literal.boolean':
        result = node.properties.value === true;
        break;
      case 'literal.float': {
        const value = node.properties.value;
        if (typeof value === 'number' && Number.isFinite(value)) result = value;
        else report(node.title + ': literal value must be a finite number.');
        break;
      }
      case 'math.add': {
        const a = numberInput(node, 'A', nextStack);
        const b = numberInput(node, 'B', nextStack);
        if (a !== null && b !== null) result = a + b;
        break;
      }
      case 'math.subtract': {
        const a = numberInput(node, 'A', nextStack);
        const b = numberInput(node, 'B', nextStack);
        if (a !== null && b !== null) result = a - b;
        break;
      }
      case 'math.multiply': {
        const a = numberInput(node, 'A', nextStack);
        const b = numberInput(node, 'B', nextStack);
        if (a !== null && b !== null) result = a * b;
        break;
      }
      case 'math.greater-than': {
        const a = numberInput(node, 'A', nextStack);
        const b = numberInput(node, 'B', nextStack);
        if (a !== null && b !== null) result = a > b;
        break;
      }
      case 'logic.and': {
        const a = booleanInput(node, 'A', nextStack);
        const b = booleanInput(node, 'B', nextStack);
        if (a !== null && b !== null) result = a && b;
        break;
      }
      case 'logic.not': {
        const value = booleanInput(node, 'Value', nextStack);
        if (value !== null) result = !value;
        break;
      }
      default:
        report(node.title + ': this node does not provide an evaluatable data output yet.');
    }

    if (result !== null || pin.dataType === 'boolean' || pin.dataType === 'float' || pin.dataType === 'string') {
      cache.set(pinId, result);
      values[pinId] = result;
    }
    return result;
  };

  for (const node of graph.nodes) {
    for (const pin of node.pins) {
      if (pin.direction === 'output' && pin.dataType !== 'exec') outputValue(pin.id, new Set());
    }
  }

  return { values, issues };
}
