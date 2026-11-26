export type Vec3 = [number, number, number];
export type PrimitiveKind = 'box' | 'sphere' | 'cylinder' | 'plane';

export interface SceneObject {
  id: string;
  name: string;
  kind: PrimitiveKind;
  parentId: string | null;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  visible: boolean;
  locked: boolean;
}

export interface SceneDefinition {
  id: string;
  name: string;
  objects: SceneObject[];
}

export interface StudioProject {
  format: 'blacksite-project';
  version: 1;
  id: string;
  name: string;
  updatedAt: string;
  activeSceneId: string;
  scenes: SceneDefinition[];
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `obj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createObject(kind: PrimitiveKind, name?: string): SceneObject {
  const names: Record<PrimitiveKind, string> = { box: 'Cube', sphere: 'Sphere', cylinder: 'Cylinder', plane: 'Plane' };
  return {
    id: createId(), name: name ?? names[kind], kind, parentId: null,
    position: [0, kind === 'plane' ? 0 : 0.5, 0], rotation: kind === 'plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
    scale: kind === 'plane' ? [1, 1, 1] : [1, 1, 1], color: kind === 'plane' ? '#323941' : '#69747b',
    visible: true, locked: false,
  };
}

export function createProject(name = 'Untitled Project'): StudioProject {
  const floor = createObject('plane', 'Ground');
  floor.scale = [12, 12, 1];
  floor.rotation = [-Math.PI / 2, 0, 0];
  floor.position = [0, 0, 0];
  const block = createObject('box', 'Blockout | A');
  block.position = [-2, 0.5, 0];
  const block2 = createObject('box', 'Blockout | B');
  block2.position = [1.5, 0.5, -1];
  block2.scale = [1.4, 1, 2];
  const sceneId = createId();
  return {
    format: 'blacksite-project', version: 1, id: createId(), name, updatedAt: new Date().toISOString(),
    activeSceneId: sceneId,
    scenes: [{ id: sceneId, name: 'Main Scene', objects: [floor, block, block2] }],
  };
}

export function validateProject(value: unknown): StudioProject {
  if (!value || typeof value !== 'object') throw new Error('This file is not a Blacksite project.');
  const project = value as Partial<StudioProject>;
  if (project.format !== 'blacksite-project' || project.version !== 1 || !Array.isArray(project.scenes)) {
    throw new Error('Unsupported project format or version.');
  }
  for (const scene of project.scenes) {
    if (!scene || typeof scene.id !== 'string' || !Array.isArray(scene.objects)) throw new Error('The project contains an invalid scene.');
    for (const object of scene.objects) {
      if (!object || typeof object.id !== 'string' || !Array.isArray(object.position) || !Array.isArray(object.rotation) || !Array.isArray(object.scale)) {
        throw new Error('The project contains an invalid scene object.');
      }
    }
  }
  return structuredClone(project as StudioProject);
}
