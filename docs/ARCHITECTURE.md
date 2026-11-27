# INFYNITI Studio — product and technical architecture

## Product definition

INFYNITI Studio is a browser-based visual game-development IDE: Unreal-style workflows delivered through the web. It is not simply a 3D model or level editor. The 3D scene workspace is the first functional editor inside a larger integrated development environment.

The goal is to let creators build and configure complete playable projects through visual tools. Writing code is an optional advanced workflow, not a prerequisite for ordinary development.

## Primary workspaces

1. **Project workspace** — project creation, settings, scenes, asset organization, save/recovery, and build targets.
2. **Level Editor** — scene viewport, world hierarchy, selection, transforms, environment authoring, and object/component inspection.
3. **Blueprint Editor** — node-graph authoring for events, functions, variables, control flow, and reusable logic.
4. **Asset Editor** — import, browse, preview, and configure models, materials, textures, audio, and other content.
5. **Gameplay/Component Editor** — configure reusable components and systems through structured visual interfaces.
6. **UI Designer** — visually author in-game menus, HUDs, and interface layouts.
7. **Runtime and Debugger** — run the project, pause/resume/stop, inspect state, view diagnostics, and debug the same project that was authored.
8. **Build and Export** — validate, package, and publish browser-playable builds.

These are coordinated workspaces in one IDE, not separate applications with separate project data.

## Core architectural rule: one project model

Every workspace edits or reads the same versioned, serializable project document. A scene created in the Level Editor, a graph created in the Blueprint Editor, an asset configured in the Asset Editor, and a screen authored in the UI Designer are all referenced by the same project.

The project document must not contain live Three.js objects, DOM nodes, GPU resources, or other transient runtime instances. It stores stable IDs, typed properties, asset references, graph definitions, scene definitions, and settings. Runtime/editor objects are constructed from those definitions.

## Layered architecture

### 1. IDE shell (src/ide/)

Owns application composition, workspace registration, editor context, command routing, keyboard routing, notifications, and editor lifecycle. `StudioApplication` is the composition root for shared services; workspace views are mounted separately. It must not own game simulation or rendering details.

### 2. Project core (src/core/)

Owns project schemas, version migrations, IDs, validation, asset references, serialization, command history, event/message contracts, and storage interfaces. This layer is framework-independent and must not import Three.js or UI modules.

### 3. Domain systems (src/domain/)

Owns typed, serializable definitions for scenes, entities, components, visual-scripting graphs, UI documents, assets, and build configuration. Domain definitions describe intent and data; they do not execute browser rendering or simulation.

### 4. Editor workspaces (src/editors/)

Each editor is a module that contributes views, inspectors, commands, and asset actions while operating on the shared project model. Initial workspaces will be Level Editor, Blueprint Editor, Asset Editor, Gameplay/Component Editor, and UI Designer.

### 5. Engine and runtime (src/engine/)

Owns rendering adapters, resource loading, physics, input, audio, animation, and simulation. The runtime consumes project definitions and constructs live instances. The editor viewport may use engine rendering services, but editor selection and panels remain editor concerns.

### 6. Platform adapters (src/platform/)

Owns browser-specific services such as IndexedDB, file import/export, workers, and future cloud storage. Core code depends on interfaces, not browser storage implementations.

## Key contracts

- **Project document:** versioned, validated, serializable root for all project content. JSON-safe domain type definitions exist for assets, Blueprint graphs, UI documents, and project settings, but those collections are not yet integrated into the current `StudioProject` schema or persistence.
- **Editor context:** selected workspace, active document/scene, selection, tool state, and panel state. This is not game state.
- **Command bus/history:** mutations are explicit commands with execute/undo behavior, so menu actions, inspectors, graphs, and viewport edits share undo/redo. `CommandBus` provides stable-ID command registration/dispatch on top of bounded history. Atomic batch operations are not yet implemented.
- **Asset registry:** stable asset IDs and metadata; scenes and graphs reference IDs rather than embedding transient loaded objects.
- **Component registry:** typed component definitions with defaults, validation, inspector metadata, and runtime adapters.
- **Visual graph definition:** serializable nodes, pins, links, variables, and graph metadata. Graphs are validated and compiled/interpreted by a separate runtime service; the canvas is only an authoring UI.
- **Runtime session:** a disposable simulation created from a project snapshot. Play/pause/stop must not corrupt the editor's authored state.
- **Storage provider:** asynchronous interface with IndexedDB as the first implementation and cloud providers as future adapters.

## Technology direction

- TypeScript for application and domain code.
- Vite 8 for the browser development/build pipeline.
- Three.js for the initial 3D rendering layer.
- GLB/glTF as the initial interchange format for 3D assets.
- IndexedDB for local project persistence, behind a provider interface.
- Web Workers where expensive import, graph compilation, or simulation tasks justify them.
- A physics engine will be selected and integrated when the runtime contract is ready, rather than coupling it to the early editor shell.

## Dependency direction

The dependency flow is inward toward stable contracts:

- core and domain do not import ide, editors, or engine.
- ide composes editor modules and platform services.
- editors depend on core/domain contracts and editor extension interfaces.
- engine consumes domain definitions and exposes runtime services.
- platform implements interfaces declared by core/application contracts.

Avoid circular imports and avoid making main.ts the home of product logic. The application entry point should only compose and start the IDE.

## Development principles

- Build real end-to-end vertical slices; no inert buttons or fake feature panels.
- Define data contracts before building multiple workspaces against them.
- Preserve existing project files through explicit migrations.
- Keep authored data separate from transient editor and runtime state.
- Prefer small modules with explicit interfaces over monolithic files.
- Add dependencies only when a real milestone needs them.
- Test type contracts, serialization/migrations, command behavior, and browser workflows.
- Do not mark a feature complete until its actual workflow has been exercised.

## Blueprint workspace implementation

Blueprint is mounted as a separate workspace. Graph documents are stored in the shared `StudioProject.blueprintGraphs` collection; validation supplies an empty collection for older version-1 projects. The first canvas supports node creation/search, movement, selection, deletion, typed pin connections, and persistence. Compilation and execution are future work. The Level Editor remains mounted and is hidden rather than destroyed when switching workspaces.

## Initial repository reality

The current repository is an early TypeScript/Vite/Three.js prototype. It has a scene viewport, primitive creation, a flat Outliner, a simple Inspector, command history, IndexedDB project storage, a workspace registry, shared editor context, a shared command bus, and serializable project contracts for assets, Blueprint graphs, and UI documents. Static shell markup is separated from the entry point, while most Level Editor controller logic remains in `src/main.ts`. The Level Editor controller is mounted from `src/editors/level/LevelEditorWorkspace.ts`, while `src/main.ts` is a small bootstrap. Blueprint graph domain types and backward-compatible project persistence exist alongside a first interactive canvas. Compilation/execution, asset pipeline, UI Designer, and game runtime remain future implementation work.

The next engineering work is to establish the IDE/project contracts and modular boundaries while preserving the working prototype. The existing Level Editor becomes the first workspace, not the definition of the whole product.
