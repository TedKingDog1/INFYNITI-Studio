import './style.css';
import { mountAppShell } from './ide/app-shell';
import { mountLevelEditorWorkspace } from './editors/level/LevelEditorWorkspace';
import { mountBlueprintWorkspace } from './editors/blueprint/BlueprintWorkspace';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('INFYNITI Studio root element #app was not found.');

mountAppShell(app);
const levelEditor = mountLevelEditorWorkspace(app);
mountBlueprintWorkspace(app, levelEditor);
