/** JSON-safe values are the only values allowed in authored project documents. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type AssetKind = 'model' | 'material' | 'texture' | 'audio' | 'font' | 'other';

export interface ProjectAsset {
  id: string;
  name: string;
  kind: AssetKind;
  source: string;
  mimeType?: string;
  metadata?: Record<string, JsonValue>;
}

export interface BlueprintPin {
  id: string;
  name: string;
  direction: 'input' | 'output';
  dataType: string;
  defaultValue?: JsonValue;
}

export interface BlueprintNode {
  id: string;
  type: string;
  title: string;
  position: [number, number];
  pins: BlueprintPin[];
  properties: Record<string, JsonValue>;
}

export interface BlueprintLink {
  id: string;
  sourceNodeId: string;
  sourcePinId: string;
  targetNodeId: string;
  targetPinId: string;
}

export interface BlueprintGraph {
  id: string;
  name: string;
  graphType: 'event' | 'function' | 'macro';
  nodes: BlueprintNode[];
  links: BlueprintLink[];
}

export interface UiElementDefinition {
  id: string;
  type: string;
  parentId: string | null;
  properties: Record<string, JsonValue>;
  children: string[];
}

export interface UiDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: UiElementDefinition[];
}

export interface ProjectSettings {
  units: 'meters' | 'centimeters';
  defaultSceneId: string;
  buildTarget: 'web';
  metadata: Record<string, JsonValue>;
}

export function createDefaultProjectSettings(sceneId: string): ProjectSettings {
  return { units: 'meters', defaultSceneId: sceneId, buildTarget: 'web', metadata: {} };
}
