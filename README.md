# INFYNITI Studio

**INFYNITI Studio** is a browser-based visual game-development IDE by Infyniti Interactive. The long-term goal is Unreal-style game-development workflows in the web: visual scene authoring, node-based scripting, asset management, gameplay/component configuration, UI design, an integrated runtime/debugger, and browser-game export.

This is not intended to be only a 3D editor. The Level Editor is the first workspace in a larger IDE.

## Current status

The repository is an early TypeScript + Vite 8 + Three.js prototype. The current application provides a basic Level Editor workspace with a 3D viewport, primitive blockout creation, single-object selection/transforms, a basic Inspector, command history, and local project persistence.

The Blueprint Editor, asset pipeline, UI Designer, game runtime, debugger, and build/export workflow are planned systems; they are not implemented yet.

## Architecture

- Product and technical architecture: docs/ARCHITECTURE.md
- Implementation roadmap: IMPLEMENTATION_PLAN.md

The central architectural rule is one shared, versioned, serializable project model used by all workspaces. Editor state and runtime state remain separate. Each workspace contributes visual authoring tools over shared project data rather than maintaining its own disconnected copy.

## Run locally or in Cloud Shell

Use the Node version pinned by .nvmrc:

```sh
nvm install
nvm use
npm install
npm run dev
```

Validation:

```sh
npm run typecheck
npm run build
```

## Existing editor shortcuts

- W / E / R: move / rotate / scale
- F: focus selection
- D: duplicate selection
- Delete / Backspace: delete selection
- Ctrl/Cmd+S: save
- Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y: undo / redo

## Compatibility

New projects use the infyniti-project format. Existing blacksite-project version 1 project files remain importable. The legacy IndexedDB database identifier is intentionally retained until a safe migration is implemented.
