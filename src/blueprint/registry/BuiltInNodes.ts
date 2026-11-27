import { NodeRegistry } from './NodeRegistry';

export const builtInNodeRegistry = new NodeRegistry();

builtInNodeRegistry.register({
  type: 'event.begin-play',
  title: 'Begin Play',
  category: 'EVENT',
  description: 'Runs when the game begins.',
  pins: [{ name: 'Then', direction: 'output', dataType: 'exec' }],
});

builtInNodeRegistry.register({
  type: 'flow.branch',
  title: 'Branch',
  category: 'FLOW CONTROL',
  description: 'Chooses a path using a Boolean condition.',
  pins: [
    { name: 'Execute', direction: 'input', dataType: 'exec' },
    { name: 'Condition', direction: 'input', dataType: 'boolean' },
    { name: 'True', direction: 'output', dataType: 'exec' },
    { name: 'False', direction: 'output', dataType: 'exec' },
  ],
});

builtInNodeRegistry.register({
  type: 'debug.print',
  title: 'Print String',
  category: 'DEBUG',
  description: 'Writes a message to the runtime debug log.',
  pins: [
    { name: 'Execute', direction: 'input', dataType: 'exec' },
    { name: 'Value', direction: 'input', dataType: 'string' },
    { name: 'Then', direction: 'output', dataType: 'exec' },
  ],
  defaultProperties: { message: 'Hello from INFYNITI' },
});
