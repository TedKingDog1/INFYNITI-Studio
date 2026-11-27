import './style.css';
import { mountAppShell } from './ide/app-shell';
import { mountLevelEditorWorkspace } from './editors/level/LevelEditorWorkspace';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('INFYNITI Studio root element #app was not found.');

mountAppShell(app);
mountLevelEditorWorkspace(app);
