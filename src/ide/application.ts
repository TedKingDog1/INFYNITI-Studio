import type { StudioProject } from '../core/types';
import { CommandBus } from './command-bus';
import { EditorContext } from './editor-context';
import { WorkspaceRegistry } from './workspaces';

/** Composition root for shared IDE services. Workspace views are mounted separately. */
export class StudioApplication {
  readonly workspaces = new WorkspaceRegistry();
  readonly commands = new CommandBus();
  readonly editorContext: EditorContext;

  constructor(project: Readonly<StudioProject>, selectedObjectIds: readonly string[] = []) {
    this.workspaces.register({ id: 'blueprint', label: 'Blueprint', description: 'Create visual gameplay logic with connected nodes.' });
    this.workspaces.register({
      id: 'level-editor',
      label: 'Level Editor',
      description: 'Author and organize 3D scenes.',
    });
    this.editorContext = new EditorContext({
      activeWorkspaceId: 'level-editor',
      activeSceneId: project.activeSceneId,
      selectedObjectIds,
    });
  }
}
