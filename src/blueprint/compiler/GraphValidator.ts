import type { BlueprintGraph } from '../../domain/project-model';
import type { NodeRegistry } from '../registry/NodeRegistry';

export interface BlueprintValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

export function validateBlueprintGraph(graph: BlueprintGraph, registry: NodeRegistry): BlueprintValidationIssue[] {
  const issues: BlueprintValidationIssue[] = [];
  const nodes = new Map(graph.nodes.map((node) => [node.id, node] as const));
  const pins = new Map(graph.nodes.flatMap((node) => node.pins.map((pin) => [pin.id, { node, pin }] as const)));
  const incoming = new Set<string>();
  const seenLinks = new Set<string>();

  for (const link of graph.links) {
    const source = pins.get(link.sourcePinId);
    const target = pins.get(link.targetPinId);
    if (!source || !target || !nodes.has(link.sourceNodeId) || !nodes.has(link.targetNodeId)) {
      issues.push({ severity: 'error', message: 'A connection points to a missing node or pin.' });
      continue;
    }
    if (source.node.id !== link.sourceNodeId || target.node.id !== link.targetNodeId) {
      issues.push({ severity: 'error', message: 'A connection endpoint does not belong to its declared node.' });
    }
    if (source.pin.direction !== 'output' || target.pin.direction !== 'input') {
      issues.push({ severity: 'error', message: 'Connections must run from output pins to input pins.', nodeId: target.node.id });
    }
    if (source.pin.dataType !== target.pin.dataType) {
      issues.push({ severity: 'error', message: 'Connection uses incompatible types: ' + source.pin.dataType + ' → ' + target.pin.dataType + '.', nodeId: target.node.id });
    }
    if (source.node.id === target.node.id) {
      issues.push({ severity: 'error', message: 'A node cannot connect to itself.', nodeId: source.node.id });
    }
    const key = link.sourcePinId + '>' + link.targetPinId;
    if (seenLinks.has(key)) issues.push({ severity: 'error', message: 'Duplicate connection detected.', nodeId: target.node.id });
    seenLinks.add(key);
    if (incoming.has(link.targetPinId)) issues.push({ severity: 'error', message: 'An input pin has more than one connection.', nodeId: target.node.id });
    incoming.add(link.targetPinId);
  }

  for (const node of graph.nodes) {
    const definition = registry.get(node.type);
    if (!definition) {
      issues.push({ severity: 'error', message: 'Unknown node type: ' + node.type + '.', nodeId: node.id });
      continue;
    }
    for (const definitionPin of definition.pins) {
      if (definitionPin.direction !== 'input' || !definitionPin.required) continue;
      const nodePin = node.pins.find((pin) => pin.name === definitionPin.name && pin.direction === 'input');
      if (nodePin && !incoming.has(nodePin.id)) {
        issues.push({ severity: 'warning', message: 'Required input "' + definitionPin.name + '" is not connected.', nodeId: node.id });
      }
    }
  }
  return issues;
}
