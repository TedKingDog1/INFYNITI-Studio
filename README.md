# INFYNITI Studio

Browser-based 3D game-development editor by Infyniti Interactive. The current application is an early editor foundation built with TypeScript, Vite, and Three.js.

## Run in the browser

Use a current Node.js LTS release:

```sh
npm install
npm run dev
```

Validation commands:

```sh
npm run typecheck
npm run build
```

## Current foundation

- Three.js scene viewport with perspective and orthographic cameras, orbit navigation, grid, axes, raycast selection, and move/rotate/scale gizmos.
- Primitive blockout creation, object inspection, transform editing, visibility and lock controls, duplication, and deletion.
- Centralized undo/redo command history with a 200-command limit.
- IndexedDB local project storage, JSON import/export, and Ctrl/Cmd+S.
- Last-active-project recovery on startup.
- Dark editor layout with resizable Outliner, viewport/asset area, and Inspector panels.
- New projects use the `infyniti-project` format. Existing `blacksite-project` version 1 files remain importable for compatibility.

## Shortcuts

- `W` / `E` / `R`: move / rotate / scale
- `F`: focus selection
- `D`: duplicate selection
- `Delete` / `Backspace`: delete selection
- `Ctrl/Cmd+S`: save
- `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`: undo / redo

## Not implemented yet

The current build is still an editor foundation. Full hierarchy/group editing, multi-object transforms, GLB asset importing, terrain tools, PBR material authoring, physics, FPS runtime, Play-in-Editor, and standalone game export remain planned work. The Play control remains disabled until the runtime milestone is implemented.

Build and browser verification must be run in the development environment before treating this branch as stable.
