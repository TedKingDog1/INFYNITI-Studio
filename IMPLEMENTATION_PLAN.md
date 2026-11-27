# INFYNITI Studio — implementation roadmap

## Product definition

INFYNITI Studio is a browser-based visual game-development IDE: Unreal-style development workflows in the web. It is not a standalone 3D editor. The Level Editor is the first workspace in a larger environment that will also include visual scripting, asset authoring, gameplay/component configuration, UI design, an integrated runtime/debugger, and browser-game export.

The goal is to let users create a complete playable project through visual interfaces. Source-code editing may exist as an advanced option, but ordinary workflows should not require hand-writing code.

## Current repository audit

The repository is an early TypeScript + Vite 8 + Three.js prototype. src/main.ts currently composes most UI and editor behavior. The project has basic scene types, command history, IndexedDB storage, and a Three.js viewport. The current application is a Level Editor prototype, not yet a full IDE.

Current implemented capabilities include primitive blockout creation, basic single-object selection/transforms, a basic Inspector, visibility/lock controls, duplication/deletion, JSON import/export, local IndexedDB persistence, and last-project recovery.

Important gaps:
- The Outliner is flat; the existing parentId field is not yet a complete scene graph.
- There is no multi-selection or group editing.
- The Inspector is currently hard-coded around the primitive object type.
- The application entry point owns too much UI and behavior.
- There is no workspace/module system, asset registry, Blueprint graph model/editor, UI Designer, game runtime, or integrated debugger.
- The visible top-left header branding has been corrected to INFYNITI; the legacy IndexedDB database identifier remains intentionally unchanged for local-data compatibility.
- The IndexedDB database name is a legacy internal identifier. Keep it unchanged until a deliberate data migration is implemented, so existing local projects are not stranded.

## Architecture

See docs/ARCHITECTURE.md for the full product and technical architecture.

The governing rule is one shared, versioned, serializable project model used by every workspace. Editor state and runtime state are separate from authored project data. The engine constructs runtime instances from the project model; it does not become the source of truth for project content.

Target layers:
1. core — project schemas, IDs, validation, migrations, serialization, commands, storage interfaces.
2. domain — serializable scenes, entities, components, graphs, assets, UI documents, and build settings.
3. ide — application shell, workspace navigation, panel layout, command routing, and lifecycle.
4. editors — Level, Blueprint, Asset, Gameplay/Component, and UI workspaces.
5. engine — rendering, resource loading, physics, input, audio, animation, and runtime simulation.
6. platform — IndexedDB, file import/export, workers, and future cloud adapters.

## Milestones

### Milestone 0 — IDE architecture and project contracts
- Confirm product scope and workspace boundaries.
- Define the dependency direction and shared-project-model rule.
- Establish a modular directory/module strategy and project-version migration policy.
- Correct legacy product branding without breaking stored project data.
- Keep the existing working prototype buildable during architectural changes.

### Sprint 1 — IDE shell and editor foundation
- Extract application composition from main.ts into a small bootstrap.
- Establish workspace registration/navigation and reusable panel/layout contracts.
- Formalize project/document, editor-context, command, asset-reference, and component contracts.
- Make the Level Editor the first registered workspace.
- Improve scene hierarchy, grouping, multi-selection, and Inspector using the shared contracts.
- Ensure save/recovery and undo/redo cover supported editor operations.
- Preserve version-1 projects with explicit validation/migration tests.

### Sprint 2 — Level and environment authoring
- Complete scene graph and entity/component authoring.
- Add GLB/glTF import and a project asset registry/browser.
- Add material and environment authoring.
- Add terrain and foliage workflows where they fit the performance budget.

### Sprint 3 — Blueprint visual scripting
- Define graph schema: graphs, nodes, pins, links, variables, and functions.
- Build graph canvas interactions: pan, zoom, select, connect, search, and inspect.
- Add type validation, graph diagnostics, and deterministic graph execution/compilation.
- Connect visual events and functions to project components through explicit interfaces.

### Sprint 4 — Runtime and debugging
- Build a runtime session from a project snapshot.
- Add play, pause, resume, stop, input routing, and runtime/editor state isolation.
- Add physics, collision, character navigation, interaction, and runtime diagnostics.
- Add reusable gameplay component systems through visual configuration.

### Sprint 5 — Asset and UI workspaces
- Expand asset import/preview/configuration for supported content types.
- Build a visual UI Designer for menus, HUDs, and interface layouts.
- Connect assets and UI documents to the shared project model.

### Sprint 6 — Production workflows and export
- Add project validation, build profiles, browser-game packaging, and deployment/export.
- Optimize loading, memory use, rendering, and large-project responsiveness.
- Add diagnostics, recovery, documentation, and regression coverage.

## Engineering workflow

For each substantial sprint:
1. Inspect the latest branch and its current implementation.
2. Define contracts and acceptance criteria before implementation.
3. Implement cohesive vertical slices rather than disconnected placeholder controls.
4. Run TypeScript checks and a production build.
5. Exercise the actual browser workflow in the user's Cloud Shell.
6. Fix observed issues and record verified limitations before calling the milestone stable.

Repository editing tools can modify source files but cannot truthfully claim the user's Cloud Shell/browser build or interaction tests have passed. Those checks must be run in the development environment before merge.
