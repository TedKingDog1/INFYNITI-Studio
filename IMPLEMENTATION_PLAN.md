# INFYNITI Studio — implementation plan

## Repository audit

The repository is a small TypeScript + Vite + Three.js editor prototype. Its source is concentrated in `src/main.ts`, with scene types, command history, IndexedDB storage, and the Three.js viewport separated into `src/core` and `src/editor`.

The original prototype had a flat Outliner despite carrying a `parentId` field, basic single-object selection and transforms, limited undo/redo, and no last-project recovery. The Play control is intentionally disabled. The project has not yet been built or exercised in a browser in the authoring environment; local build verification is still required.

## Architecture decisions

- Keep serializable project and scene definitions independent from Three.js runtime objects and editor UI.
- Keep scene mutations behind commands so undo and redo can be shared by the viewport, Outliner, and Inspector.
- Persist projects through an asynchronous storage interface. IndexedDB is the local provider; cloud providers will be added behind the same abstraction.
- Use Three.js for rendering and GLB/glTF asset loading. Add Rapier when the physics/runtime sprint begins, not before it is needed.
- Keep editor state separate from game runtime state. Play-in-Editor must execute the same serialized scene authored by the editor.
- Prefer focused modules over expanding the main entry point into a monolith.

## Sprint sequence

### Sprint 1 — Editor foundation
- Complete scene hierarchy and grouping.
- Multi-object selection and manipulation.
- Component-oriented Inspector foundation.
- Reliable command history and project recovery/autosave.
- Consistent INFYNITI branding and production-quality editor layout.

### Sprint 2 — Environment Studio
- GLB/glTF importing and asset management.
- Drag-and-drop placement.
- PBR materials.
- Terrain creation, sculpting, painting, and foliage.
- Lighting, atmosphere, sky, and environment settings.

### Sprint 3 — Game runtime foundation
- Rapier physics integration.
- FPS controller, collision, and interaction.
- Spawn points and player configuration.
- Reusable gameplay components and runtime settings.

### Sprint 4 — Play-in-Editor
- Runtime execution inside the editor viewport.
- Play, pause, resume, and stop.
- Runtime/editor state separation and input routing.
- Runtime inspection and debugging foundations.

### Sprint 5 — Gameplay systems
- Weapons, inventory, AI, objectives, audio, animation, and vehicle foundations.

### Sprint 6 — Production and export
- Standalone web-game export.
- Packaging, performance optimization, error handling, and documentation.

## Verification policy

For each sprint:
1. Inspect the existing implementation before changing it.
2. Implement a cohesive feature set without placeholder controls.
3. Run TypeScript checks and a production build.
4. Test the relevant workflows in a browser.
5. Fix observed failures before marking the sprint stable.

The current authoring environment cannot run the user's Cloud Shell project, so verification must be completed there before merging this sprint branch.
