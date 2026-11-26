# Blacksite Studio

Browser-based 3D FPS environment editor by Infyniti Interactive. This repository currently contains the Milestone 1 editor foundation.

## Run locally

Install a current Node.js LTS release, then run:

```sh
npm install
npm run dev
```

Run `npm run typecheck` for TypeScript validation and `npm run build` for a production build.

## Milestone 1 functionality

- Three.js scene viewport with perspective and orthographic views, orbit/pan/zoom navigation, grid, axes, selection, focus, and move/rotate/scale gizmos.
- Primitive creation for boxes, spheres, cylinders, and planes; editable scene objects appear in the outliner and inspector.
- Transform, visibility, lock, rename, duplicate, and delete operations with centralized undo/redo history.
- Grid snapping controls and draggable panel dividers.
- Versioned JSON project format, IndexedDB local project storage, project open/save, and JSON import/export.
- A blockout scene is provided when a new project is created.

## Shortcuts

- `W` / `E` / `R`: move / rotate / scale
- `F`: focus selection
- `D`: duplicate selection
- `Delete` / `Backspace`: delete selection
- `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`: undo / redo

## Current limitations

The play controls are intentionally disabled until the runtime and play-in-editor milestones. GLB importing, terrain, material editing, physics, FPS gameplay, and standalone game export are also later milestones. The Milestone 1 implementation has not yet been built or exercised in a browser because Node.js, npm, and a browser executable were unavailable in the authoring environment.

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the repository audit, architecture decisions, milestone scope, and verification notes.
