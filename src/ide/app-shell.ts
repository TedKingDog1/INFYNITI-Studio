/** Static IDE shell markup. Workspace behavior is mounted by editor modules. */
export function mountAppShell(app: HTMLElement): void {
  app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="INFYNITI Studio home"><span class="brand-mark">I</span><span>INFYNITI <b>STUDIO</b></span></a>
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
  <div class="projectbar"><div><span class="crumb">PROJECT</span><span id="project-name">Untitled Project</span><span class="save-dot" id="save-state">●</span></div><div class="scene-crumb"><span class="crumb">SCENE</span><span id="scene-name">Main Scene</span><span class="scene-dot"></span></div><div class="workspace-crumb"><span class="crumb">WORKSPACE</span><button class="workspace-switch active" data-workspace="level-editor">LEVEL EDITOR</button><button class="workspace-switch" data-workspace="blueprint">BLUEPRINT</button><span id="workspace-name" hidden>Level Editor</span></div><div class="projectbar-right"><button class="project-export" data-action="export">EXPORT JSON</button> LOCAL PROJECT <span class="sync-icon">◈</span></div></div>
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
  <footer class="statusbar"><div><span class="status-dot"></span><span>READY</span><span class="status-divider">|</span><span id="status-message">All changes saved locally</span></div><div><span>INFYNITI STUDIO <b>1.0.0</b></span><span class="status-divider">|</span><span>WEBGL</span><span class="status-divider">|</span><span id="viewport-size">— × —</span></div></footer>
  <input id="project-file" type="file" accept="application/json,.json" hidden>
  <div id="toast" class="toast" role="status"></div>
  `;
}
