# Full Project Audit

## 1. Executive Summary

This project is a small Vite + React canvas drawing prototype. It has a visible editor shell, a few working drawing tools, Redux state for tool settings, and a custom canvas renderer, but it is not close to a production painting/design platform.

The most serious problems are in the editor foundation: canvas resize destroys artwork, history stores unlimited full-canvas data URLs, input handling is mouse-only, layer support is mostly fictional, several files are dead or broken scaffolding, and the app has no tests. The build succeeds, but lint fails. The UI presents disabled or fake platform features such as Open, Zoom, menu Undo/Redo, and status zoom.

Current status: usable as a demo/prototype for simple browser drawing experiments. Not production-ready.

## 2. Current Product Classification

Classification: Prototype.

It is beyond a static mockup because brush, eraser, fill, color picker, simple shapes, undo/redo, and PNG export exist. It is not an MVP because critical editor flows are incomplete or unsafe: no persistence, no real project model, no layers UI, no import/open, no reliable resize handling, no mobile/stylus support, no tests, no accessibility baseline, and no production deployment setup.

| Classification | Verdict | Reason |
|---|---:|---|
| Demo | Partly | It demonstrates a canvas editor concept. |
| Prototype | Yes | It has experimental working tools but weak architecture and incomplete flows. |
| MVP | No | Core platform flows are missing or fragile. |
| Beta | No | No QA coverage, no production hardening, no real user workflows. |
| Production-ready | No | Lint fails, tests are absent, editor data can be lost, and deployment basics are missing. |

## 3. Critical Problems

### Issue 1: Canvas resize destroys user artwork

- Severity: Critical
- Category: Data loss / Canvas architecture
- File(s): `src/graphics/core/Renderer.js`
- Problem: `_handleResize()` assigns `canvas.width` and `canvas.height` for every layer on every observed container resize. In Canvas 2D, changing width or height clears bitmap contents.
- Why it matters: A user can lose work by resizing the window, opening dev tools, changing layout, rotating a device, or any action that changes the container size.
- Evidence: `Renderer.js` lines around `_handleResize()` set `canvas.width = this.width` and `canvas.height = this.height`, then only repaint the background layer white. The drawing layer is not preserved.
- Recommended fix: Preserve layer bitmaps before resize and redraw them after resizing, or decouple document canvas size from viewport size. Add explicit document dimensions and viewport zoom/pan instead of using container size as source of truth.

### Issue 2: Lint fails

- Severity: High
- Category: Build/tooling quality gate
- File(s): `src/graphics/tools/BaseTool.js`
- Problem: `npm.cmd run lint` fails with 5 `no-unused-vars` errors.
- Why it matters: A production project needs passing static checks before merge/deploy. Failing lint also hides future regressions because CI would already be red.
- Evidence: Command result: `BaseTool.js` reports unused `toolState` and `event` parameters in base methods.
- Recommended fix: Rename intentionally unused parameters to ignored names and configure lint accordingly, or remove unused parameters from base methods while keeping subclass signatures consistent.

### Issue 3: No automated tests exist

- Severity: High
- Category: Testing / QA
- File(s): `package.json`, entire `src/`
- Problem: There is no test script and no test files.
- Why it matters: Editor behavior is stateful, visual, and easy to regress. Without tests, undo/redo, fill, resize, color picking, export, and pointer behavior cannot be trusted.
- Evidence: `npm.cmd test` returns `Missing script: "test"`. `rg --files` shows no test directory or test files.
- Recommended fix: Add Vitest for tool/history unit tests, React Testing Library for UI state tests, Playwright for E2E editor flows, and run them in CI.

### Issue 4: History is memory-heavy and unbounded

- Severity: High
- Category: Performance / Reliability
- File(s): `src/graphics/history/HistoryManager.js`
- Problem: Every history entry stores a full active-canvas `toDataURL()` string with no cap, no compression strategy, and no memory pressure handling.
- Why it matters: Repeated drawing on a large canvas can consume large amounts of memory, freeze the UI, or crash the tab.
- Evidence: `pushState()` calls `this.renderer.getActiveCanvas()?.toDataURL()` and pushes the result into `undoStack`; there is no maximum stack length.
- Recommended fix: Use bounded history. Store deltas, commands, compressed blobs, or `ImageBitmap`/`ImageData` snapshots with caps. Add memory limits and predictable pruning.

### Issue 5: Editor input is mouse-only

- Severity: High
- Category: UX / Device support / Accessibility
- File(s): `src/components/Canvas/MainCanvas.jsx`
- Problem: The editor registers `mousedown`, `mousemove`, `mouseup`, and `mouseleave` only.
- Why it matters: Touch screens, tablets, stylus input, pen pressure, pointer capture, and many mobile scenarios are unsupported. Releasing the pointer outside the canvas can also break drawing finalization.
- Evidence: `MainCanvas.jsx` uses `container.addEventListener('mousedown'...)`, `mousemove`, `mouseup`, and `mouseleave`; no pointer or touch events exist.
- Recommended fix: Move to Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) with pointer capture, pressure metadata, and browser default prevention where appropriate.

### Issue 6: Dead and broken editor scaffolding exists

- Severity: High
- Category: Maintainability / Feature integrity
- File(s): `src/app/slices/layerSlice.js`, `src/graphics/tools/ShapeTool.js`, `src/graphics/tools/TextTool.js`, `src/graphics/tools/TriangleTool.js`
- Problem: `layerSlice.js` and `ShapeTool.js` are empty. `TextTool.js` and `TriangleTool.js` are present but not wired into the UI or engine and contain stale API assumptions.
- Why it matters: Dead and half-built code misleads maintainers, increases risk during future work, and suggests architecture churn without cleanup.
- Evidence: `layerSlice.js` and `ShapeTool.js` have 0 lines. `TextTool.js` references `state.layers.activeLayerId`, `fontSize`, `fontFamily`, and `this.historyManager`, none of which are wired into the current engine. `TriangleTool.js` never sets `this.ctx` before reading from it.
- Recommended fix: Either remove dead scaffolding or finish it behind tested feature flags. Do not keep broken editor modules in production source.

### Issue 7: Fill and color picker operate on the wrong visual model

- Severity: High
- Category: Canvas correctness
- File(s): `src/graphics/tools/FillTool.js`, `src/graphics/tools/ColorPickerTool.js`, `src/graphics/core/Renderer.js`
- Problem: Fill and color picker read only the active drawing canvas, not the visible composite of all layers.
- Why it matters: Users expect fill and picker to react to what they see. With a white background layer and a transparent drawing layer, transparent pixels in the drawing layer are treated as transparent, not white.
- Evidence: Both tools call `this.renderer.getActiveContext()` and use `getImageData()` on that single context. The renderer has a background layer and drawing layer.
- Recommended fix: Add a composite sampling API in the renderer. Let tools choose active-layer or composite behavior explicitly.

### Issue 8: Fake or disabled product features are shown in primary UI

- Severity: Medium
- Category: Product trust / UX
- File(s): `src/components/Header/Header.jsx`, `src/components/StatusBar/StatusBar.jsx`
- Problem: Menus expose disabled Open, Undo, Redo, Zoom In, and Zoom Out. Status bar always displays `100%` even though zoom does not exist.
- Why it matters: Users cannot tell what is real. Fake platform affordances make the product feel unfinished and reduce trust.
- Evidence: Header dropdown items use `className="dropdown-item disabled"` without actual disabled attributes or behavior. Status bar hardcodes `100%`.
- Recommended fix: Remove fake actions until implemented, or wire them to real editor commands with correct disabled state and keyboard shortcuts.

## 4. Architecture Problems

The current architecture is not scalable for a real painting/design platform.

| Problem | File(s) | Impact | Recommended structure |
|---|---|---|---|
| Editor bootstrap is inside a React component | `src/components/Canvas/MainCanvas.jsx` | UI, Redux, rendering, input, tools, history, and export are coupled. | Move editor runtime to `src/editor/core` and expose a small React adapter. |
| Renderer owns DOM canvas creation and Redux dispatch | `src/graphics/core/Renderer.js` | Core rendering cannot be tested or reused without React/Redux assumptions. | Renderer should emit events or return state; React layer should dispatch. |
| Tools depend on DOM mouse events | `src/graphics/tools/*.js` | Tools are hard to test and cannot support pointer/touch/stylus cleanly. | Normalize input events into editor commands or pointer payloads. |
| No real document model | `src/app/slices/toolSlice.js`, `src/graphics/core/Renderer.js` | Canvas size, layers, active layer, history, and persistence are implicit. | Add a project/document model with dimensions, layers, metadata, and settings. |
| Layer architecture is only cosmetic | `Renderer.js`, empty `layerSlice.js` | Future layers UI, visibility, ordering, opacity, and export cannot be added safely. | Add `editor/layers` state and renderer synchronization. |
| Redux trigger counters are command transport | `historySlice.js`, `uiSlice.js`, `MainCanvas.jsx` | Undo/redo/save are not modeled as editor actions, only incrementing numbers. | Use an editor command bus or reducer-backed editor controller. |
| Global CSS duplicates canvas styles | `src/assets/App.css`, `src/components/Canvas/MainCanvas.css` | Styling ownership is unclear and drift-prone. | Keep layout styles in app shell and component styles in component CSS only. |

Recommended top-level structure:

```text
src/
  app/
    store.js
    slices/
  editor/
    core/
      EditorController.js
      Renderer.js
      DocumentModel.js
    tools/
      BrushTool.js
      EraserTool.js
      FillTool.js
      ShapeTools.js
      ColorPickerTool.js
    history/
      HistoryManager.js
    layers/
      LayerManager.js
    io/
      exportImage.js
      importImage.js
      projectStorage.js
    input/
      pointerInput.js
  features/
    toolbar/
    header/
    canvas/
    status-bar/
    panels/
  shared/
    ui/
    constants/
    utils/
  tests/
```

## 5. Code Quality Problems

| Severity | File(s) | Problem | Recommended fix |
|---|---|---|---|
| High | `MainCanvas.jsx` | 116-line component does too many things: initializes renderer, tools, history, listeners, Redux synchronization, export, undo/redo. | Split into `useEditorEngine`, input adapter, command handlers, and dumb canvas host component. |
| High | `TextTool.js` | Broken assumptions: references `state.layers.activeLayerId`, `fontFamily`, `fontSize`, and `this.historyManager` that current app does not provide. | Remove or rebuild text tool against the current editor controller. |
| High | `TriangleTool.js` | `this.ctx` is never assigned before use, so the tool is nonfunctional if wired. | Refactor shape tools through a common base with tested context setup. |
| Medium | `LineTool.js`, `RectangleTool.js`, `CircleTool.js` | Repeated snapshot/preview/finalize logic. | Extract a shape preview base class or command flow. |
| Medium | `toolSlice.js` | Tool IDs and fill modes are hardcoded strings across UI and tool code. | Centralize tool and fill-mode constants. |
| Medium | `Header.jsx` | Uses visual `disabled` class instead of actual `disabled` attributes for fake menu items. | Use actual disabled buttons, real commands, and menu semantics. |
| Medium | `ColorPalette.jsx` | Preset colors are embedded in the component. | Move palette config to constants/user settings. |
| Low | Multiple files | Uzbek development comments describe old changes, fixes, and future work. | Replace change-history comments with durable intent comments or remove them. |
| Low | `README.md` | Empty README. | Add setup, scripts, product scope, architecture, and known limitations. |

## 6. UI/UX Problems

The UI resembles an early Microsoft Paint-inspired shell, but too many controls are incomplete.

| Severity | File(s) | Problem | Impact | Recommended fix |
|---|---|---|---|---|
| High | `Header.jsx` | File/Edit/View menus contain disabled or fake actions. | Users see a platform UI but cannot complete platform flows. | Hide unfinished actions or implement them. |
| High | `MainCanvas.jsx`, CSS | Canvas fills the whole workspace with no visible document page boundary. | Users cannot distinguish document size from viewport size. | Render a document canvas with explicit dimensions, shadow, checkerboard/white background, and zoom controls. |
| Medium | `StatusBar.jsx` | Zoom is hardcoded to `100%`. | Misleading status information. | Connect to real zoom state or remove. |
| Medium | `RibbonToolbar.jsx`, `Header.jsx` | Undo/Redo exist in toolbar and fake-disabled menu, causing inconsistent command surfaces. | Users may not know which commands work. | Use one command source and reflect state everywhere. |
| Medium | `ColorPalette.css` | Color swatches are 20x20 pixels. | Poor touch usability and weak accessibility. | Increase touch target size to at least 44x44 CSS px for touch layouts. |
| Medium | `index.css`, `App.css` | `overflow: hidden`, `100vh`, `100vw`, and no responsive media rules. | Small screens and mobile browsers are likely cramped or unusable. | Add responsive layouts, overflow strategy, and mobile toolbar behavior. |
| Medium | `Header.css`, toolbar CSS | No custom focus-visible styles. | Keyboard users cannot reliably track focus. | Add visible focus rings and keyboard menu behavior. |
| Low | `Header.jsx` | Brand says `ProPaints`; document title says `ProPaint`. | Product naming is inconsistent. | Choose one product name. |

## 7. Canvas/Editor Problems

This project contains a drawing/editor surface, so the editor architecture is the most important risk area.

| Area | Current state | Problem | Recommended fix |
|---|---|---|---|
| Brush | `Brush.js` draws with line caps/joins and current foreground color. | No smoothing, pressure, pointer sampling, brush engine, opacity, blend modes, or stabilization. | Add a brush pipeline with normalized pointer samples and configurable brush settings. |
| Eraser | `Eraser.js` draws using background color. | This is not a true eraser on transparent layers and fails if background is not solid. | Use `globalCompositeOperation = "destination-out"` for layer erasing or provide explicit paint-over-background mode. |
| Shapes | Line/rect/circle use `getImageData` snapshot previews. | Full-canvas snapshot per shape drag is expensive and repeated. | Use a temporary preview layer or offscreen canvas. |
| Fill | `FillTool.js` uses naive stack flood fill. | Can be slow on large regions, no tolerance, no anti-alias handling, no bounds validation beyond loop checks. | Implement optimized scanline flood fill with tolerance and composite/active-layer modes. |
| Color picker | `ColorPickerTool.js` reads active context only. | Picks transparent pixels instead of visible colors when background/layers are involved. | Sample from rendered composite. |
| Undo/redo | `HistoryManager.js` uses active canvas data URLs. | Full snapshots are unbounded and only cover active canvas. | Bounded command or bitmap history with layer-aware state. |
| Clear canvas | No clear command exists. | Basic editor workflow is missing. | Add clear active layer / clear document with confirmation and undo support. |
| Save/export | `Renderer.exportImage()` downloads PNG only. | No format options, no project save, no error handling, no user-selected filename except default. | Add export pipeline for PNG/JPEG/WebP/SVG where relevant and native project save. |
| Open/import | UI shows Open disabled. | Users cannot import images or reopen projects. | Add image import and project open/storage. |
| Zoom/pan | Hardcoded status only. | Large or small canvases are not usable. | Add viewport transform, zoom controls, pan, fit-to-screen. |
| Resize | Renderer follows container size. | Viewport resize mutates document data. | Separate document size from viewport size. |
| Layers | Two internal layers exist, no real layer model. | Cannot support user layers, ordering, opacity, visibility, locks, merge, or blend modes. | Add layer manager and layer panel state. |
| Collaboration | No model or persistence. | Future collaboration cannot be built on raw canvas DOM state. | Introduce serializable document operations and sync-friendly command model. |

## 8. State Management Problems

Current state lives in two places: Redux for UI/tool flags, and mutable class instances for the actual editor.

| Severity | File(s) | Problem | Why it matters | Recommended fix |
|---|---|---|---|---|
| High | `MainCanvas.jsx` | `engineRef` stores renderer, history, tools, and active tool outside Redux. | Most meaningful editor state is invisible to app state and tests. | Wrap editor runtime in a controller with explicit commands and state events. |
| High | `historySlice.js`, `uiSlice.js` | `undoTrigger`, `redoTrigger`, and `saveTrigger` are counters used to trigger effects. | Counters are indirect and can become stale or hard to reason about. | Use command dispatching through editor controller or Redux middleware. |
| High | `layerSlice.js` | Layer state file is empty and not registered. | The platform cannot scale into real layers. | Add layer slice/model only when real layer behavior is implemented. |
| Medium | `toolSlice.js` | Tool settings are flat and global. | Future tools need different settings; inactive tool settings may overwrite each other. | Store per-tool settings and shared color state separately. |
| Medium | `StatusBar.jsx` | Cursor and canvas size update through Redux on every mouse move/resize. | Frequent Redux updates can cause unnecessary React renders. | Throttle status updates or keep high-frequency pointer status outside global Redux. |
| Medium | `MainCanvas.jsx` | `stateRef` mirrors Redux tool state manually. | Manual mirroring is fragile. | Pass current tool state through controller subscriptions or stable selectors. |

Recommended future state architecture:

- Redux or Zustand for app-shell state: panels, menus, selected tool, persisted user preferences.
- Editor controller for document state: layers, canvas dimensions, active layer, history, viewport, selection.
- Command API for editor actions: `execute("brushStroke", payload)`, `undo()`, `redo()`, `export()`, `resizeDocument()`.
- Serializable project model for saving, loading, testing, and future collaboration.
- High-frequency pointer drawing should avoid React renders.

## 9. Performance Problems

| Severity | File(s) | Cause | Impact | Recommended fix |
|---|---|---|---|---|
| High | `HistoryManager.js` | `toDataURL()` on every committed action. | Synchronous encoding blocks main thread and inflates memory. | Use bounded binary snapshots, command deltas, or async `toBlob()` where export is needed. |
| High | `Renderer.js` | Canvas dimensions reset on resize. | Clears data and reallocates canvases during layout changes. | Preserve bitmaps and separate document from viewport. |
| High | `FillTool.js` | Naive pixel stack flood fill over full image data. | Large fills can freeze UI. | Use optimized scanline fill and possibly worker/offscreen processing. |
| Medium | Shape tools | `getImageData()` full canvas on mouse down and `putImageData()` on every mouse move. | Dragging shapes on large canvases can stutter. | Use overlay preview canvas or retained vector preview. |
| Medium | `StatusBar.jsx`, `MainCanvas.jsx` | Dispatches cursor position to Redux on every mouse move. | Causes frequent store updates and status rerenders. | Throttle, use refs, or local external store for status. |
| Medium | `Renderer.exportImage()` | `toDataURL()` creates large base64 strings. | Memory spike on export. | Use `toBlob()` and object URLs with cleanup. |
| Low | Bundle | Build output JS is about 230.74 kB, gzip 72.71 kB. | Acceptable now, but no lazy boundaries exist. | Add lazy loading only when real panels/features grow. |

## 10. Security Problems

No exposed secrets, auth, network calls, unsafe HTML rendering, file upload handling, or environment variable usage were found in the current source. The security risk is currently low because the app is client-only and small, but production hardening is missing.

| Severity | OWASP-style category | File(s) | Problem | Recommended fix |
|---|---|---|---|---|
| Medium | A05 Security Misconfiguration | `index.html`, deployment config absent | No Content Security Policy, security headers, or deployment config. | Add hosting headers for CSP, `X-Content-Type-Options`, frame policy, referrer policy, and permissions policy. |
| Medium | A04 Insecure Design | `Renderer.exportImage()` | Export creates a programmatic download with no error handling or user feedback. | Use `toBlob()`, handle failures, and clean object URLs. |
| Medium | A08 Software/Data Integrity | `package.json`, CI absent | No CI enforcing lockfile install, audit, lint, build, or tests. | Add CI using `npm ci`, audit, lint, build, tests. |
| Low | A06 Vulnerable Components | Dependencies | `npm.cmd audit --omit=dev` found 0 vulnerabilities, but many packages are outdated. | Schedule dependency maintenance and test upgrades. |
| Low | A03 Injection | `TextTool.js` | Text tool writes user text to canvas, not DOM HTML. Current XSS risk is low, but the tool creates a DOM textarea dynamically. | Keep text as plain text; never use `innerHTML` for text editing. |
| Low | Client-side trust | Future project loading | No project import exists yet. Future file parsing could become risky. | Validate imported files, cap dimensions, reject malformed project JSON, and sandbox image decoding assumptions. |

## 11. Accessibility Problems

| Severity | WCAG area | File(s) | Problem | Recommended fix |
|---|---|---|---|---|
| High | Keyboard accessibility | `MainCanvas.jsx`, toolbar/header components | Canvas drawing and most editor workflows are pointer-only. | Add keyboard shortcuts, focus management, and non-pointer alternatives where possible. |
| High | Name, Role, Value | `ColorPalette.jsx` | Color swatch buttons have no accessible names. | Add `aria-label` such as `Set foreground color #000000`; expose right-click behavior through keyboard/menu. |
| Medium | Focus Visible | CSS files | Buttons rely on browser defaults or no explicit focus styling. | Add clear `:focus-visible` styles for menus, toolbar, swatches, and shape buttons. |
| Medium | Semantic menus | `Header.jsx` | Menu UI is plain div/button/dropdown without menu semantics or keyboard navigation. | Implement accessible menu button pattern or keep simple real buttons. |
| Medium | Disabled controls | `Header.jsx` | Fake disabled items use only CSS class, not `disabled`/`aria-disabled`. | Use actual disabled attributes and prevent focus where appropriate. |
| Medium | Target Size | `ColorPalette.css`, toolbar CSS | 20x20 swatches and 32x32 tool buttons are below comfortable touch size. | Use at least 44x44 touch targets on touch layouts. |
| Medium | Canvas fallback | `MainCanvas.jsx` | Canvas container has no accessible fallback, label, or role. | Add an accessible editor label and status text; document limitations for screen readers. |
| Medium | Responsive/mobile access | `index.css`, `App.css` | `overflow: hidden` and no media queries can trap content. | Add responsive toolbar/panel behavior and avoid inaccessible overflow clipping. |
| Low | Contrast | CSS | Some grey-on-dark labels may be marginal, especially disabled text. | Run axe/contrast checks and adjust tokens. |

## 12. Testing Gaps

There are no automated tests.

Critical tests to add first:

| Priority | Test type | Scenarios |
|---|---|---|
| P0 | Unit | `HistoryManager` push/undo/redo limits, redo clearing, empty state behavior. |
| P0 | Unit | `FillTool` flood fill boundaries, same-color no-op, transparent pixels, tolerance once added. |
| P0 | Unit | Color conversion and color picker composite behavior. |
| P0 | E2E | Brush stroke appears, undo removes it, redo restores it. |
| P0 | E2E | Resize viewport does not destroy artwork after architecture fix. |
| P1 | Component | Toolbar active tool state, disabled undo/redo state, line width changes. |
| P1 | Component | Header menu open/close, save command dispatch, disabled items semantics. |
| P1 | E2E | Shape preview/finalization for line, rectangle, circle. |
| P1 | E2E | Save/export produces an image and handles errors. |
| P2 | Accessibility | axe checks for labels, focus order, contrast, disabled semantics. |
| P2 | Visual regression | Desktop and mobile editor layout screenshots. |

## 13. Build, Tooling, and Dependency Problems

Command results from inspection:

| Command | Result | Notes |
|---|---|---|
| `npm run build` | Failed in PowerShell | `npm.ps1` blocked by Windows execution policy. |
| `npm.cmd run build` | Passed | Vite built `dist/index.html`, CSS 3.93 kB gzip 1.20 kB, JS 230.74 kB gzip 72.71 kB. |
| `npm.cmd run lint` | Failed | 5 errors in `src/graphics/tools/BaseTool.js`. |
| `npm.cmd test` | Failed | Missing `test` script. |
| `npm.cmd audit --omit=dev` | Passed | Found 0 vulnerabilities. |
| `npm.cmd outdated --long` | Nonzero because outdated packages exist | Most major dependencies have newer wanted/latest versions. |

Dependency concerns:

| Package area | Current observation | Concern |
|---|---|---|
| React | `react` and `react-dom` at 19.1.0, newer 19.2.6 available | Behind current patch/minor line; upgrade should be tested. |
| Vite | 7.0.6 installed, newer 7.3.3 wanted and 8.0.12 latest | Tooling updates may require Node/deploy compatibility checks. |
| Redux Toolkit | 2.8.2 installed, 2.11.2 available | Behind current stable line. |
| lucide-react | 0.525.0 installed, 1.14.0 latest | Major update available; icon imports should be tested. |
| ESLint ecosystem | ESLint, `@eslint/js`, hooks plugin, refresh plugin, globals are behind | Lint baseline already fails; update after fixing current lint. |

Package script gaps:

- No `test` script.
- No `typecheck` script, despite `@types/react` packages being installed.
- No `format` or `format:check`.
- No `preview` smoke test.
- No CI script grouping `lint`, `test`, and `build`.
- No `npm ci` documentation.

## 14. Deployment and Production Readiness Problems

| Severity | File(s) | Problem | Recommended fix |
|---|---|---|---|
| High | `README.md` | Empty project documentation. | Add setup, scripts, supported browsers, known limitations, and deployment notes. |
| High | Deployment config absent | No Netlify/Vercel/static host configuration or headers. | Add deployment target config and security/cache headers. |
| Medium | `index.html` | Favicon points to `/vite.svg`, but `public/` is empty. | Add real favicon/assets or remove broken reference. |
| Medium | `index.html` | Missing description, Open Graph, theme color, manifest, robots, sitemap. | Add metadata appropriate for the product. |
| Medium | Routing | Single root app only; no route handling strategy. | If future routes are added, configure SPA fallback. |
| Medium | Environment | No `.env.example` or config strategy. | Add when backend/auth/storage settings appear. |
| Medium | Error handling | No app-level error boundary. | Add React error boundary and user-safe fallback UI. |
| Medium | Browser support | Uses `ResizeObserver` without fallback. | Define supported browsers and fallback/polyfill strategy if needed. |

## 15. Missing Platform Features

Required before this can be a serious web painting/design platform:

- Real project save/load, not only PNG export.
- Image import/open.
- Document dimensions independent from viewport.
- Resize document and resize canvas workflows.
- Zoom, pan, fit-to-screen, and navigator/minimap for large canvases.
- Layer panel with add/delete/rename/reorder/visibility/lock/opacity/blend/merge.
- True eraser with transparent layer support.
- Brush engine with smoothing, opacity, hardness, pressure, spacing, and presets.
- Selection tools, move/transform, crop, rotate, flip.
- Text tool rebuilt and wired into state/history.
- More shape tools with editable properties.
- Color picker sampling visible composite.
- Fill tolerance and anti-alias handling.
- Undo/redo history limits and recovery behavior.
- Keyboard shortcuts with command palette/help.
- Responsive touch/stylus support.
- Autosave and crash recovery.
- Export options: PNG, JPEG, WebP, transparent background, scale options.
- Templates and preset canvas sizes.
- User settings and recent projects.
- Test suite, CI, release process, and production deployment config.

## 16. Recommended Target Architecture

Target architecture should separate product UI from editor runtime.

```text
src/
  app/
    store.js
    appShellSlice.js
    preferencesSlice.js
  editor/
    core/
      EditorController.js
      DocumentModel.js
      Renderer.js
      Viewport.js
    input/
      pointerEvents.js
      keyboardShortcuts.js
    tools/
      ToolRegistry.js
      BrushTool.js
      EraserTool.js
      FillTool.js
      ColorPickerTool.js
      ShapeTool.js
      TextTool.js
    layers/
      LayerManager.js
      Layer.js
    history/
      HistoryManager.js
      commands.js
    io/
      exportImage.js
      importImage.js
      projectSerializer.js
      localProjectStorage.js
  features/
    canvas/
    toolbar/
    header/
    status-bar/
    layers-panel/
    properties-panel/
  shared/
    ui/
    constants/
    utils/
  tests/
```

Required public interfaces:

| Interface | Purpose |
|---|---|
| `EditorController.execute(command, payload)` | Single entry point for editor mutations. |
| `EditorController.subscribe(listener)` | UI updates without coupling core to Redux. |
| `DocumentModel` | Serializable canvas/project state: size, layers, metadata. |
| `ToolRegistry` | Tool registration, settings, cursor, and input routing. |
| `LayerManager` | Layer creation, ordering, compositing, visibility, active layer. |
| `HistoryManager` | Bounded undo/redo over commands or memory-capped snapshots. |
| `Viewport` | Zoom, pan, coordinate transforms, device-pixel-ratio handling. |
| `io` modules | PNG/JPEG/WebP export, image import, native project save/load. |

## 17. Prioritized Roadmap

### Phase 0: emergency fixes

- Goal: Stop obvious breakage and remove misleading UI.
- Tasks: Preserve canvas contents on resize or temporarily lock document size; fix lint errors; remove or hide fake menu actions; remove or quarantine broken `TextTool`, `TriangleTool`, empty `ShapeTool`, and empty `layerSlice`.
- Expected outcome: App does not lose work on resize and basic quality gates can pass.
- Risk level: High, because resize and history touch core editor behavior.

### Phase 1: stabilization

- Goal: Make current prototype predictable.
- Tasks: Add explicit document size; replace mouse events with pointer events; add pointer capture; add app error boundary; add real disabled states and accessible labels; document setup in README.
- Expected outcome: Current tools behave consistently across common desktop and touch-capable devices.
- Risk level: Medium.

### Phase 2: editor refactor

- Goal: Separate editor runtime from React UI.
- Tasks: Extract editor controller, renderer, input adapter, tool registry, history manager, and document model; remove Redux trigger-counter command flow.
- Expected outcome: Tool behavior becomes testable and future layers/import/export features have a stable foundation.
- Risk level: High.

### Phase 3: core platform features

- Goal: Build the minimum credible painting platform.
- Tasks: Add project save/load, image import, layer panel, clear canvas, true eraser, zoom/pan, canvas resize, brush settings, fill tolerance, and export options.
- Expected outcome: Users can create, edit, save, reopen, and export real work.
- Risk level: High.

### Phase 4: testing and QA

- Goal: Create confidence before release.
- Tasks: Add Vitest unit tests, component tests, Playwright E2E tests, axe checks, visual regression screenshots, and manual QA checklist.
- Expected outcome: Critical editor flows are covered before every release.
- Risk level: Medium.

### Phase 5: production deployment

- Goal: Make deployment repeatable and secure.
- Tasks: Add CI, deploy config, headers, metadata, favicon, manifest, robots, sitemap if needed, release checklist, and dependency maintenance workflow.
- Expected outcome: Static deployment can be trusted and audited.
- Risk level: Medium.

### Phase 6: advanced features

- Goal: Move from painting app to platform.
- Tasks: Add templates, recent projects, cloud sync/auth if needed, collaboration-ready document operations, advanced brushes, selections, transforms, text editing, keyboard shortcuts, and plugin/tool extensibility.
- Expected outcome: The app can grow beyond a single-user local prototype.
- Risk level: High.

## 18. QA Test Plan

### Manual QA checklist

- Launch app in dev and production preview.
- Confirm no console errors on load.
- Draw with brush at min, default, and max thickness.
- Change foreground color with left click.
- Change background color with right click or provide an accessible alternative.
- Use eraser over strokes and verify expected transparency/background behavior.
- Use fill on empty canvas, enclosed shapes, and same-color areas.
- Use color picker on drawing pixels, background pixels, and transparent pixels.
- Draw line, rectangle, and circle in every fill mode.
- Test undo and redo after brush, eraser, fill, and shapes.
- Confirm redo clears after a new edit following undo.
- Save/export image and inspect the output.
- Resize browser while artwork exists; verify artwork is preserved after fix.
- Drag outside canvas and release; verify drawing finalizes correctly.
- Test right-click behavior and context menu behavior.
- Navigate toolbar and menus by keyboard.
- Verify visible focus state on all controls.
- Test 320px mobile width, tablet width, and desktop width.
- Test touch or stylus input after pointer event migration.
- Verify disabled controls are not focus traps.
- Run axe accessibility scan.

### Automated testing plan

- Unit tests with Vitest for color conversion, fill algorithm, history state, layer operations, and coordinate transforms.
- Component tests with React Testing Library for toolbar, palette, header menus, status bar, and disabled states.
- Playwright E2E tests for draw, undo, redo, save/export, shape creation, color changes, and viewport resize preservation.
- Accessibility checks with axe in Playwright.
- Visual regression screenshots for desktop, narrow mobile, and high-DPI canvas.
- CI pipeline: `npm ci`, `npm run lint`, `npm run test`, `npm run build`, `npm audit --omit=dev`.

## 19. Final Verdict

What is good:

- The project has a clear product direction: a browser painting/editor app.
- Basic brush, eraser, fill, color picker, simple shapes, undo/redo, and PNG export are present.
- The dependency set is small and the production vulnerability audit currently reports 0 vulnerabilities.
- Vite production build succeeds.

What is weak:

- The editor architecture is fragile and tightly coupled to React component lifecycle.
- User artwork can be destroyed by viewport resize.
- History is memory-heavy and unbounded.
- Layer, text, and shape scaffolding is incomplete or broken.
- The UI advertises features that do not exist.
- Accessibility, mobile input, production deployment, documentation, and testing are missing.
- Lint fails.

Can this become a real platform?

Yes, but not by layering more UI on top of the current architecture. It needs an editor-core refactor, a real document model, layer-aware rendering/history, pointer-event input, persistence, tests, and production deployment discipline.

What must happen next:

1. Fix data-loss behavior on resize.
2. Fix lint and add the first test framework.
3. Remove or quarantine broken dead scaffolding.
4. Refactor the editor into a controller/document/tool/history architecture.
5. Build project save/load, import/export, layers, zoom/pan, and accessible input as first-class platform features.
