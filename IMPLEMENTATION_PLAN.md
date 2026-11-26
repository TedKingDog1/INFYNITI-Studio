# Blacksite Studio — implementation plan

## Repository audit

The repository contains no application source, package manifest, documentation, or prior commits. There is no existing functionality to preserve. The working tree is clean. Node.js, npm, TypeScript, Vite, and a browser executable are not available in the current environment, so builds and browser interaction checks cannot run here.

## Architecture findings

- Start from a modular TypeScript/Vite application with Three.js as the only runtime dependency for Milestone 1.
- Keep serializable scene definitions separate from Three.js objects and the editor UI.
- Put scene changes behind commands so undo and redo are consistent across viewport, outliner, and inspector.
- Persist project JSON through an asynchronous storage interface; use IndexedDB locally and leave cloud providers independent.
- Treat a runtime/game layer, Rapier physics, asset importing, terrain, and export as later milestones.

## Milestone 1 plan

1. Establish the Vite/TypeScript app shell and a restrained dark editor layout.
2. Add typed, versioned project/scene/object data and IndexedDB project storage.
3. Add a command/history layer for add, delete, rename, transform, visibility, and duplication operations.
4. Build a Three.js viewport with perspective/orthographic cameras, grid/axes, orbit navigation, raycast selection, and transform gizmos.
5. Connect toolbar actions, hierarchical outliner, and inspector to shared scene state.
6. Add new/open/save, JSON import/export, and essential keyboard shortcuts.
7. Review implementation statically. Run type checks, build, tests, and browser checks when a Node/browser toolchain is available.

## Milestone 1 scope and limitations

This milestone covers the editor foundation only. Environment assets, GLB import, terrain, materials authoring, physics, FPS runtime, play mode, and standalone export remain out of scope. The viewport starts with a small editable blockout scene to make selection and transforms immediately usable.
