import './style.css';
import { CommandHistory } from './core/history';
import { createId, createObject, createProject, validateProject, type PrimitiveKind, type SceneObject, type StudioProject } from './core/types';
import { IndexedDbProjectStorage } from './core/storage';
import { Viewport } from './editor/viewport';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Blacksite Studio home"><span class="brand-mark">B</span><span>BLACKSITE <b>STUDIO</b></span></a>
    <span class="top-divider"></span>
    <div class="file-actions"><button class="icon-button" data-action="new" title="New project">＋ <span>New</span></button><button class="icon-button" data-action="open" title="Open project">▱ <span>Open</span></button><button class="icon-button" data-action="save" title="Save project">▣ <span>Save</span></button></div>
    <span class="top-divider"></span>
    <div class="history-actions"><button class="icon-button" data-action="undo" title="Undo (Ctrl+Z)">↶</button><button class="icon-button" data-action="redo" title="Redo (Ctrl+Shift+Z)">↷</button></div>
    <span class="top-divider"></span>
    <div class="tool-actions"><button class="tool-button active" data-tool="translate" title="Move (W)">✣</button><button class="tool-button" data-tool="rotate" title="Rotate (E)">⟳</button><button class="tool-button" data-tool="scale" title="Scale (R)">⤢</button></div>
    <div class="toolbar-spacer"></div>
    <div class="snap-controls"><span>SNAP</span><select id="snap"><option value="0">Off</option><option value="0.25">0.25 m</option><option value="0.5">0.5 m</option><option value="1" selected>1 m</option></select><button class="icon-button compact" data-action="camera" title="Toggle perspective / orthographic">Perspective</button></div>
    <button class="play-button" disabled title="Play mode arrives in Milestone 4">▶ <span>Play</span></button>
    <button class="icon-button settings-button" data-action="settings" title="Project settings">⚙</button>
  </header>
  <div class="projectbar"><div><span class="crumb">PROJECT</span><span id="project-name">Untitled Project</span><span class="save-dot" id="save-state">●</span></div><div class="scene-crumb"><span class="crumb">SCENE</span><span id="scene-name">Main Scene</span><span class="scene-dot"></span></div><div class="projectbar-right"><button class="project-export" data-action="export">EXPORT JSON</button> LOCAL PROJECT <span class="sync-icon">◈</span></div></div>
  <main class="workspace">
    <aside class="panel outliner-panel">
      <div class="panel-title"><div><span class="panel-glyph">☷</span> WORLD OUTLINER</div><button class="subtle-button" data-action="add-menu" title="Add object">＋</button></div>
      <div class="outliner-tools"><span>SCENE HIERARCHY</span><button data-action="expand" title="Expand all">⌄</button></div>
      <div id="outliner" class="outliner-list"></div>
      <div class="panel-footer"><span class="status-dot"></span><span id="object-count">0 OBJECTS</span></div>
    </aside>
    <div class="splitter" data-split="left" title="Drag to resize"></div>
    <section class="center-column">
      <div class="viewport-wrap">
        <div class="viewport-toolbar"><div class="viewport-tabs"><button class="view-tab active">SCENE VIEW</button><button class="view-tab">GAME VIEW <i>SOON</i></button></div><div class="view-options"><button class="view-chip" data-action="grid">▦ <span>Grid</span></button><span class="view-separator"></span><span class="camera-label" id="camera-label">PERSPECTIVE</span><button class="view-chip" data-action="focus">◎ <span>Focus</span></button></div></div>
        <div id="viewport" class="viewport"></div>
        <div class="viewport-hint"><kbd>ALT</kbd> + <span>Drag to orbit</span><kbd>MMB</kbd> <span>Pan</span><kbd>Scroll</kbd> <span>Zoom</span></div>
        <div class="axis-label axis-x">X</div><div class="axis-label axis-y">Y</div><div class="axis-label axis-z">Z</div>
        <div class="view-cube"><span>TOP</span><div class="cube">◆</div><small>WORLD</small></div>
        <div class="transform-readout" id="transform-readout">WORLD&nbsp; / &nbsp;METERS</div>
      </div>
      <div class="splitter horizontal" data-split="bottom" title="Drag to resize"></div>
      <section class="bottom-panel">
        <div class="bottom-head"><div class="bottom-tabs"><button class="bottom-tab active">CREATE</button><button class="bottom-tab">CONSOLE <i>0</i></button></div><span class="bottom-note">QUICK ADD · SELECT TO PLACE AT ORIGIN</span></div>
        <div class="primitive-list"><button class="primitive-card" data-create="box"><span class="primitive-icon cube-icon">◇</span><span><b>Cube</b><small>BOX MESH</small></span><kbd>＋</kbd></button><button class="primitive-card" data-create="sphere"><span class="primitive-icon sphere-icon">◉</span><span><b>Sphere</b><small>SPHERE MESH</small></span><kbd>＋</kbd></button><button class="primitive-card" data-create="cylinder"><span class="primitive-icon cylinder-icon">⬭</span><span><b>Cylinder</b><small>CYLINDER MESH</small></span><kbd>＋</kbd></button><button class="primitive-card" data-create="plane"><span class="primitive-icon plane-icon">▱</span><span><b>Plane</b><small>PLANE MESH</small></span><kbd>＋</kbd></button></div>
      </section>
    </section>
    <div class="splitter" data-split="right" title="Drag to resize"></div>
    <aside class="panel inspector-panel">
      <div class="panel-title"><div><span class="panel-glyph">◫</span> INSPECTOR</div><button class="subtle-button" title="Inspector options">···</button></div>
      <div id="inspector" class="inspector-content"></div>
    </aside>
  </main>
  <footer class="statusbar"><div><span class="status-dot"></span><span>READY</span><span class="status-divider">|</span><span id="status-message">All changes saved locally</span></div><div><span>BLACKSITE STUDIO <b>1.0.0</b></span><span class="status-divider">|</span><span>WEBGL</span><span class="status-divider">|</span><span id="viewport-size">— × —</span></div></footer>
  <input id="project-file" type="file" accept="application/json,.json" hidden>
  <div id="toast" class="toast" role="status"></div>
`;

const storage = new IndexedDbProjectStorage();
const history = new CommandHistory();
let project = createProject();
let selectedId: string | null = project.scenes[0].objects[1]?.id ?? null;
let activeTool: 'translate' | 'rotate' | 'scale' = 'translate';
let gridVisible = true;
let autoSaveTimer = 0;
let toastTimer = 0;
let transformStart: { position: number[]; rotation: number[]; scale: number[] } | null = null;
const scene = () => project.scenes.find((entry) => entry.id === project.activeSceneId)!;
const selection = () => scene().objects.find((object) => object.id === selectedId) ?? null;
const outliner = document.querySelector<HTMLDivElement>('#outliner')!;
const inspector = document.querySelector<HTMLDivElement>('#inspector')!;
const viewportHost = document.querySelector<HTMLDivElement>('#viewport')!;
const viewport = new Viewport(viewportHost, {
  select(id) { selectedId = id; renderPanels(); },
  transformStart() { const obj = selection(); transformStart = obj ? snapshotTransform(obj) : null; },
  transformEnd(id, _before, after) {
    const obj = scene().objects.find((item) => item.id === id);
    if (!obj || !transformStart) return;
    applyTransform(obj, after);
    const old = transformStart;
    transformStart = null;
    history.recordExecuted({ label: 'Transform object', execute: () => applyTransform(obj, after), undo: () => applyTransform(obj, old) });
    markChanged();
  },
});

function snapshotTransform(obj: SceneObject) { return { position: [...obj.position], rotation: [...obj.rotation], scale: [...obj.scale] }; }
function applyTransform(obj: SceneObject, value: { position: number[]; rotation: number[]; scale: number[] }): void {
  obj.position = value.position.slice(0, 3) as SceneObject['position'];
  obj.rotation = value.rotation.slice(0, 3) as SceneObject['rotation'];
  obj.scale = value.scale.slice(0, 3) as SceneObject['scale'];
  paintViewport();
  if (selectedId === obj.id) renderInspector();
}
function selectedChange(label: string, mutate: (obj: SceneObject) => void, undoMutate: (obj: SceneObject) => void): void {
  const obj = selection(); if (!obj) return;
  objectChange(obj, label, mutate, undoMutate);
}
function objectChange(obj: SceneObject, label: string, mutate: (obj: SceneObject) => void, undoMutate: (obj: SceneObject) => void): void {
  history.execute({ label, execute: () => mutate(obj), undo: () => undoMutate(obj) });
  markChanged(); renderPanels();
}
function addObject(kind: PrimitiveKind): void {
  const obj = createObject(kind);
  obj.name = `${obj.name} ${scene().objects.filter((item) => item.kind === kind).length + 1}`;
  const oldSelection = selectedId;
  history.execute({ label: `Create ${obj.name}`, execute: () => { scene().objects.push(obj); selectedId = obj.id; }, undo: () => { scene().objects = scene().objects.filter((item) => item.id !== obj.id); selectedId = oldSelection; } });
  markChanged(); renderPanels();
}
function deleteSelected(): void {
  const obj = selection(); if (!obj || obj.locked) return;
  const index = scene().objects.indexOf(obj); const oldSelection = selectedId;
  history.execute({ label: `Delete ${obj.name}`, execute: () => { scene().objects.splice(scene().objects.indexOf(obj), 1); selectedId = null; }, undo: () => { scene().objects.splice(Math.min(index, scene().objects.length), 0, obj); selectedId = oldSelection; } });
  markChanged(); renderPanels();
}
function duplicateSelected(): void {
  const obj = selection(); if (!obj) return;
  const clone = structuredClone(obj); clone.id = createId(); clone.name = `${obj.name} Copy`; clone.position[0] += 1;
  const oldSelection = selectedId;
  history.execute({ label: `Duplicate ${obj.name}`, execute: () => { scene().objects.splice(scene().objects.indexOf(obj) + 1, 0, clone); selectedId = clone.id; }, undo: () => { scene().objects = scene().objects.filter((item) => item.id !== clone.id); selectedId = oldSelection; } });
  markChanged(); renderPanels();
}
function paintViewport(): void { viewport.sync(scene().objects); }
function renderPanels(): void { paintViewport(); renderOutliner(); renderInspector(); }
function renderOutliner(): void {
  const objects = scene().objects;
  const icon: Record<PrimitiveKind, string> = { box: '◇', sphere: '◉', cylinder: '⬭', plane: '▱' };
  outliner.innerHTML = objects.map((obj) => `<div class="outliner-row ${obj.id === selectedId ? 'selected' : ''} ${obj.visible ? '' : 'hidden-object'}" data-id="${escapeHtml(obj.id)}"><span class="tree-indent"></span><span class="tree-caret">›</span><span class="object-icon ${obj.kind}">${icon[obj.kind]}</span><span class="object-name" title="${escapeHtml(obj.name)}">${escapeHtml(obj.name)}</span><button class="row-action visibility ${obj.visible ? '' : 'off'}" data-action="visibility" data-id="${escapeHtml(obj.id)}" title="Toggle visibility">${obj.visible ? '◉' : '○'}</button><button class="row-action lock ${obj.locked ? 'on' : ''}" data-action="lock" data-id="${escapeHtml(obj.id)}" title="Toggle lock">${obj.locked ? '▣' : '⌑'}</button></div>`).join('') || '<div class="empty-state">No objects in this scene.</div>';
  document.querySelector('#object-count')!.textContent = `${objects.length} OBJECT${objects.length === 1 ? '' : 'S'}`;
}
function renderInspector(): void {
  const obj = selection();
  if (!obj) { inspector.innerHTML = '<div class="inspector-empty"><span>◫</span><b>No object selected</b><p>Select an object in the scene or outliner to inspect its properties.</p></div>'; return; }
  inspector.innerHTML = `<div class="object-heading"><div class="object-avatar ${obj.kind}">${obj.kind === 'box' ? '◇' : obj.kind === 'sphere' ? '◉' : obj.kind === 'cylinder' ? '⬭' : '▱'}</div><div><span class="object-type">${obj.kind.toUpperCase()} MESH</span><strong>${escapeHtml(obj.name)}</strong></div><button data-action="delete" class="delete-button" title="Delete object">⌫</button></div>
    <section class="inspector-section"><button class="section-heading" data-section="transform"><span class="section-chevron">⌄</span><span class="section-icon">✣</span> TRANSFORM <span class="section-menu">···</span></button><div class="section-body" data-section-body="transform">
      ${vectorInput('Position', 'position', obj.position, 'm')}${vectorInput('Rotation', 'rotation', obj.rotation.map((v) => +(v * 180 / Math.PI).toFixed(2)) as SceneObject['rotation'], '°')}${vectorInput('Scale', 'scale', obj.scale, '')}
    </div></section>
    <section class="inspector-section"><button class="section-heading" data-section="object"><span class="section-chevron">⌄</span><span class="section-icon">▧</span> OBJECT <span class="section-menu">···</span></button><div class="section-body" data-section-body="object"><label class="property-row"><span>Name</span><input class="text-input" data-prop="name" value="${escapeHtml(obj.name)}"></label><label class="property-row"><span>Visible</span><input type="checkbox" data-prop="visible" ${obj.visible ? 'checked' : ''}></label><label class="property-row"><span>Locked</span><input type="checkbox" data-prop="locked" ${obj.locked ? 'checked' : ''}></label><label class="property-row"><span>Object ID</span><code class="id-value">${escapeHtml(obj.id.slice(0, 12))}</code></label></div></section>
    <section class="inspector-section muted-section"><button class="section-heading" data-section="material"><span class="section-chevron">›</span><span class="section-icon">◈</span> MATERIAL <small>COMING IN MILESTONE 2</small></button></section>
    <section class="inspector-section muted-section"><button class="section-heading" data-section="collision"><span class="section-chevron">›</span><span class="section-icon">⬡</span> COLLISION <small>COMING IN MILESTONE 3</small></button></section>`;
}
function vectorInput(label: string, prop: string, values: number[], unit: string): string {
  return `<div class="vector-row"><span>${label}</span><div class="vector-fields">${values.map((value, index) => `<label class="axis-field axis-${'xyz'[index]}"><i>${'XYZ'[index]}</i><input type="number" step="0.1" data-vector="${prop}" data-index="${index}" value="${Number(value.toFixed(3))}"><small>${unit}</small></label>`).join('')}</div></div>`;
}
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!); }
function markChanged(): void {
  project.updatedAt = new Date().toISOString();
  document.querySelector('#save-state')!.classList.add('dirty');
  document.querySelector('#status-message')!.textContent = 'Unsaved changes';
  window.clearTimeout(autoSaveTimer);
  autoSaveTimer = window.setTimeout(() => { void saveProject(true); }, 1200);
}
function showToast(message: string, error = false): void {
  const toast = document.querySelector<HTMLDivElement>('#toast')!;
  toast.textContent = message; toast.classList.toggle('error', error); toast.classList.add('visible');
  window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}
async function saveProject(quiet = false): Promise<void> {
  try {
    project.updatedAt = new Date().toISOString();
    await storage.put(structuredClone(project));
    document.querySelector('#save-state')!.classList.remove('dirty');
    document.querySelector('#status-message')!.textContent = 'All changes saved locally';
    if (!quiet) showToast('Project saved to this browser');
  } catch (error) { showToast(error instanceof Error ? error.message : 'Could not save project', true); }
}
function renderProjectMeta(): void {
  document.querySelector('#project-name')!.textContent = project.name;
  document.querySelector('#scene-name')!.textContent = scene().name;
}
function newProject(): void {
  const name = window.prompt('Name your project', 'Untitled Project');
  if (name === null) return;
  project = createProject(name.trim() || 'Untitled Project'); selectedId = project.scenes[0].objects[1]?.id ?? null;
  history.clear(); renderProjectMeta(); renderPanels(); void saveProject(true); showToast('New project created');
}
async function openProject(): Promise<void> {
  try {
    const projects = await storage.list();
    if (projects.length) {
      const labels = projects.map((item, index) => `${index + 1}. ${item.name}`).join('\n');
      const choice = window.prompt(`Open a local project by number, or choose Cancel to import a JSON file.\n\n${labels}`, '1');
      if (choice !== null) {
        const index = Number(choice) - 1;
        if (!Number.isInteger(index) || index < 0 || index >= projects.length) { showToast('Choose a project number from the list.', true); return; }
        const loaded = await storage.get(projects[index].id);
        if (loaded) { setProject(validateProject(loaded)); return; }
      }
    }
    document.querySelector<HTMLInputElement>('#project-file')!.click();
  } catch (error) { showToast(error instanceof Error ? error.message : 'Could not open projects', true); }
}
function setProject(value: StudioProject): void {
  project = validateProject(value); selectedId = scene().objects[0]?.id ?? null; history.clear();
  renderProjectMeta(); renderPanels(); showToast(`Opened ${project.name}`);
}
function downloadProject(): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `${project.name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'blacksite-project'}.json`;
  link.click(); URL.revokeObjectURL(url); showToast('Project JSON exported');
}
function bindSplitters(): void {
  document.querySelectorAll<HTMLElement>('.splitter').forEach((splitter) => splitter.addEventListener('pointerdown', (event) => {
    event.preventDefault(); splitter.setPointerCapture(event.pointerId);
    const root = document.querySelector<HTMLElement>('.workspace')!;
    const move = (moveEvent: PointerEvent) => {
      if (splitter.dataset.split === 'left') root.style.setProperty('--left-width', `${Math.max(190, Math.min(moveEvent.clientX, 360))}px`);
      if (splitter.dataset.split === 'right') root.style.setProperty('--right-width', `${Math.max(240, Math.min(window.innerWidth - moveEvent.clientX, 420))}px`);
      if (splitter.dataset.split === 'bottom') root.style.setProperty('--bottom-height', `${Math.max(118, Math.min(window.innerHeight - moveEvent.clientY - 133, 260))}px`);
    };
    const up = () => { splitter.removeEventListener('pointermove', move); splitter.removeEventListener('pointerup', up); };
    splitter.addEventListener('pointermove', move); splitter.addEventListener('pointerup', up);
  }));
}

document.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-tool], [data-create], [data-section]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'new') newProject();
  if (action === 'open') void openProject();
  if (action === 'save') void saveProject();
  if (action === 'export') downloadProject();
  if (action === 'undo') { if (history.canUndo) { history.undo(); markChanged(); } }
  if (action === 'redo') { if (history.canRedo) { history.redo(); markChanged(); } }
  if (action === 'delete') deleteSelected();
  if (action === 'visibility' || action === 'lock') {
    const obj = scene().objects.find((item) => item.id === target.dataset.id);
    if (obj) { const key = action === 'visibility' ? 'visible' : 'locked'; const before = obj[key]; objectChange(obj, `${key === 'visible' ? 'Toggle visibility' : 'Toggle lock'}`, (item) => { item[key] = !before; }, (item) => { item[key] = before; }); }
  }
  if (action === 'grid') { gridVisible = !gridVisible; viewport.setGridVisible(gridVisible); target.classList.toggle('active', gridVisible); }
  if (action === 'camera') { const ortho = viewport.toggleCamera(); target.textContent = ortho ? 'Orthographic' : 'Perspective'; document.querySelector('#camera-label')!.textContent = ortho ? 'ORTHOGRAPHIC' : 'PERSPECTIVE'; }
  if (action === 'focus') viewport.focus(selectedId ?? undefined);
  if (action === 'add-menu') { const kind = window.prompt('Create primitive: box, sphere, cylinder, or plane', 'box')?.toLowerCase(); if (kind && ['box', 'sphere', 'cylinder', 'plane'].includes(kind)) addObject(kind as PrimitiveKind); }
  if (action === 'expand') showToast('Scene hierarchy is expanded');
  if (action === 'settings') { const name = window.prompt('Project name', project.name); if (name !== null && name.trim()) { const before = project.name; history.execute({ label: 'Rename project', execute: () => { project.name = name.trim(); }, undo: () => { project.name = before; } }); renderProjectMeta(); markChanged(); } }
  if (target.dataset.tool) { activeTool = target.dataset.tool as typeof activeTool; viewport.setTransformMode(activeTool); document.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle('active', button === target)); }
  if (target.dataset.create) addObject(target.dataset.create as PrimitiveKind);
  if (target.dataset.section) { const body = document.querySelector<HTMLElement>(`[data-section-body="${target.dataset.section}"]`); if (body) { body.hidden = !body.hidden; target.querySelector('.section-chevron')!.textContent = body.hidden ? '›' : '⌄'; } }
});

outliner.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.closest('[data-action]')) return;
  const row = target.closest<HTMLElement>('[data-id]'); if (!row) return;
  selectedId = row.dataset.id!; renderPanels();
});
outliner.addEventListener('dblclick', (event) => {
  const target = event.target as HTMLElement; const row = target.closest<HTMLElement>('[data-id]'); if (!row || target.closest('button')) return;
  const obj = scene().objects.find((item) => item.id === row.dataset.id); if (!obj) return;
  const value = window.prompt('Rename object', obj.name); if (value === null || !value.trim()) return;
  const before = obj.name; const after = value.trim();
  history.execute({ label: `Rename ${before}`, execute: () => { obj.name = after; }, undo: () => { obj.name = before; } }); markChanged(); renderPanels();
});
inspector.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement; const obj = selection(); if (!obj) return;
  const prop = input.dataset.prop;
  if (prop === 'name' && input.value.trim()) { const before = obj.name; const after = input.value.trim(); selectedChange('Rename object', (item) => { item.name = after; }, (item) => { item.name = before; }); }
  if (prop === 'visible' || prop === 'locked') { const before = obj[prop]; const after = input.checked; selectedChange(`Set ${prop}`, (item) => { item[prop] = after; }, (item) => { item[prop] = before; }); }
  if (input.dataset.vector) {
    const property = input.dataset.vector as 'position' | 'rotation' | 'scale';
    const index = Number(input.dataset.index); const old = snapshotTransform(obj); const next = snapshotTransform(obj);
    next[property][index] = Number(input.value) || 0;
    if (property === 'rotation') next.rotation[index] = (Number(input.value) || 0) * Math.PI / 180;
    history.execute({ label: `Set ${property}`, execute: () => applyTransform(obj, next), undo: () => applyTransform(obj, old) }); markChanged(); renderPanels();
  }
});
document.querySelector<HTMLSelectElement>('#snap')!.addEventListener('change', (event) => viewport.setSnap(Number((event.target as HTMLSelectElement).value) || null));
document.querySelector<HTMLInputElement>('#project-file')!.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  try { setProject(validateProject(JSON.parse(await file.text()))); await storage.put(project); } catch (error) { showToast(error instanceof Error ? error.message : 'Could not import project JSON', true); }
  (event.target as HTMLInputElement).value = '';
});
history.subscribe(() => {
  document.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled = !history.canUndo;
  document.querySelector<HTMLButtonElement>('[data-action="redo"]')!.disabled = !history.canRedo;
  renderPanels();
});
window.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('input,textarea,select') || target.isContentEditable) return;
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) { if (history.canRedo) { history.redo(); markChanged(); } } else if (history.canUndo) { history.undo(); markChanged(); } }
  else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); if (history.canRedo) { history.redo(); markChanged(); } }
  else if (event.key === 'Delete' || event.key === 'Backspace') deleteSelected();
  else if (event.key.toLowerCase() === 'w') { activeTool = 'translate'; viewport.setTransformMode(activeTool); document.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle('active', (button as HTMLElement).dataset.tool === activeTool)); }
  else if (event.key.toLowerCase() === 'e') { activeTool = 'rotate'; viewport.setTransformMode(activeTool); document.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle('active', (button as HTMLElement).dataset.tool === activeTool)); }
  else if (event.key.toLowerCase() === 'r') { activeTool = 'scale'; viewport.setTransformMode(activeTool); document.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle('active', (button as HTMLElement).dataset.tool === activeTool)); }
  else if (event.key.toLowerCase() === 'f') viewport.focus(selectedId ?? undefined);
  else if (event.key.toLowerCase() === 'd' && !mod) duplicateSelected();
});

bindSplitters();
renderProjectMeta();
renderPanels();
viewport.setTransformMode(activeTool);
document.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled = true;
document.querySelector<HTMLButtonElement>('[data-action="redo"]')!.disabled = true;
const resizeReadout = () => { document.querySelector('#viewport-size')!.textContent = `${viewportHost.clientWidth} × ${viewportHost.clientHeight}`; };
new ResizeObserver(resizeReadout).observe(viewportHost); resizeReadout();
void storage.put(project).catch(() => { document.querySelector('#status-message')!.textContent = 'Local storage unavailable'; });
