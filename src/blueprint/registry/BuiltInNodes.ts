import { NodeRegistry } from './NodeRegistry';

export const builtInNodeRegistry = new NodeRegistry();

builtInNodeRegistry.register({
  type: 'event.begin-play', title: 'Begin Play', category: 'EVENT',
  description: 'Runs when the game begins.',
  pins: [{ name: 'Then', direction: 'output', dataType: 'exec' }],
  operation: 'event.begin-play',
});
builtInNodeRegistry.register({
  type: 'flow.branch', title: 'Branch', category: 'FLOW CONTROL',
  description: 'Chooses a path using a Boolean condition.',
  pins: [
    { name: 'Execute', direction: 'input', dataType: 'exec' },
    { name: 'Condition', direction: 'input', dataType: 'boolean', required: true },
    { name: 'True', direction: 'output', dataType: 'exec' },
    { name: 'False', direction: 'output', dataType: 'exec' },
  ],
  operation: 'flow.branch',
});
builtInNodeRegistry.register({
  type: 'debug.print', title: 'Print String', category: 'DEBUG',
  description: 'Writes a message to the runtime debug log.',
  pins: [
    { name: 'Execute', direction: 'input', dataType: 'exec' },
    { name: 'Value', direction: 'input', dataType: 'string' },
    { name: 'Then', direction: 'output', dataType: 'exec' },
  ],
  defaultProperties: { message: 'Hello from INFYNITI' },
  operation: 'debug.print',
});
builtInNodeRegistry.register({
  type: 'data.boolean', title: 'Boolean', category: 'LITERALS',
  description: 'Outputs a constant true or false value.',
  pins: [{ name: 'Value', direction: 'output', dataType: 'boolean' }],
  defaultProperties: { value: false },
  operation: 'literal.boolean',
});
builtInNodeRegistry.register({
  type: 'data.float', title: 'Float', category: 'LITERALS',
  description: 'Outputs a constant numeric value.',
  pins: [{ name: 'Value', direction: 'output', dataType: 'float' }],
  defaultProperties: { value: 1 },
  operation: 'literal.float',
});
for (const [type, title, operation] of [
  ['math.add', 'Add', 'math.add'],
  ['math.subtract', 'Subtract', 'math.subtract'],
  ['math.multiply', 'Multiply', 'math.multiply'],
] as const) {
  builtInNodeRegistry.register({
    type, title, category: 'MATH',
    description: 'Performs a floating-point arithmetic operation.',
    pins: [
      { name: 'A', direction: 'input', dataType: 'float', required: true },
      { name: 'B', direction: 'input', dataType: 'float', required: true },
      { name: 'Result', direction: 'output', dataType: 'float' },
    ],
    operation,
  });
}
builtInNodeRegistry.register({
  type: 'math.greater-than', title: 'Greater Than', category: 'MATH',
  description: 'Returns true when A is greater than B.',
  pins: [
    { name: 'A', direction: 'input', dataType: 'float', required: true },
    { name: 'B', direction: 'input', dataType: 'float', required: true },
    { name: 'Result', direction: 'output', dataType: 'boolean' },
  ],
  operation: 'math.greater-than',
});
builtInNodeRegistry.register({
  type: 'logic.and', title: 'Boolean AND', category: 'LOGIC',
  description: 'Returns true only when both inputs are true.',
  pins: [
    { name: 'A', direction: 'input', dataType: 'boolean', required: true },
    { name: 'B', direction: 'input', dataType: 'boolean', required: true },
    { name: 'Result', direction: 'output', dataType: 'boolean' },
  ],
  operation: 'logic.and',
});
builtInNodeRegistry.register({
  type: 'logic.not', title: 'Boolean NOT', category: 'LOGIC',
  description: 'Inverts a Boolean value.',
  pins: [
    { name: 'Value', direction: 'input', dataType: 'boolean', required: true },
    { name: 'Result', direction: 'output', dataType: 'boolean' },
  ],
  operation: 'logic.not',
});
