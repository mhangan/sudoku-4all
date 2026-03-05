# Sudoku 4 All — Technical Specification (Recommended Stack)

## 1. Purpose

This document proposes a concrete technology stack and implementation approach that satisfies the functional requirements defined in [functional-spec.md](functional-spec.md).

---

## 2. Technical Constraints Derived from Functional Spec

From the functional requirements, the implementation must be:

- Browser-based and responsive on desktop/tablet/mobile.
- Fully client-side (no backend, no accounts).
- Persisted in browser local storage.
- Reliable for keyboard, mouse, and touch interactions.
- Capable of generating puzzles with unique solutions by difficulty.
- Non-blocking during expensive operations (generation/validation).
- Optionally offline-capable.

---

## 3. Recommended Technology Stack

### 3.1 Core

- **Language:** TypeScript (strict mode)
- **UI Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Routing:** React Router (single-page app with view-based navigation)

### 3.2 Persistence and Data Safety

- **Storage:** Browser `localStorage` (as required by functional spec)
- **Schema Validation:** Zod (for save/load validation and migration guards)
- **ID Generation:** Nano ID (or `crypto.randomUUID`) for completed game records

### 3.3 Puzzle Engine

- **Sudoku Engine:** Custom TypeScript module for:
  - Puzzle generation by difficulty
  - Solver for validation and hint correctness
  - Unique-solution checks
- **Threading:** Web Worker for puzzle generation/solver-heavy tasks

### 3.4 Quality and Delivery

- **Unit/Integration Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Linting/Formatting:** ESLint + Prettier
- **Offline Support (optional, recommended):** `vite-plugin-pwa` (Workbox-based service worker)
- **Deployment Target:** GitHub Pages via GitHub Actions (primary)

---

## 4. Why This Stack Fits the Requirements

- **No server required:** React + Vite builds a static SPA that runs entirely in-browser.
- **Local persistence:** `localStorage` directly supports SAVE-01..SAVE-06 and BEST-08.
- **Cross-device input:** React event model supports touch, mouse, and keyboard handling for BOARD-06..BOARD-10 and INPUT requirements.
- **Performance:** Web Worker prevents UI stalls during generation/solver operations (non-functional performance note).
- **Offline-first path:** PWA plugin supports the recommended offline behavior without changing app architecture.
- **Maintainability:** TypeScript + Zod reduces runtime errors in save schema/version migrations.

---

## 5. High-Level Architecture

## 5.1 Modules

- `app/`
  - App shell, routes/views, global providers
- `features/game/`
  - Board rendering, input modes, annotation mode, timer, validation/hints UI
- `features/best-games/`
  - Leaderboard list, sorting, cap=50, clear flow with confirmation
- `domain/sudoku/`
  - Generator, solver, difficulty calibrator, unique-solution checker
- `state/`
  - Zustand stores for game session and best games
- `persistence/`
  - `localStorage` repository layer, schema versioning, migration helpers
- `workers/`
  - Worker entry for expensive Sudoku operations
- `ui/`
  - Reusable controls (digit pad, toggles, dialogs, badges)

### 5.2 Data Flow

1. User actions dispatch state updates in Zustand.
2. State changes trigger persistence writes to `localStorage`.
3. Heavy Sudoku computations run in Web Worker and return results via message passing.
4. UI re-renders from typed state snapshots.

---

## 6. Data Storage Design

### 6.1 Keys

- In-progress game: `sudoku4all_current`
- Best games list: `sudoku4all_bestgames`

### 6.2 Versioning

Use schema version fields exactly as in functional spec data model:

- `InProgressGame.version`
- `BestGames.version`

On load:

1. Parse JSON safely.
2. Validate with Zod.
3. If schema is outdated, run migration.
4. If migration fails, discard invalid payload and continue with safe defaults.

---

## 7. Requirement-to-Implementation Mapping

- **Difficulty + uniqueness (DIFF-01..06):** domain generator + solver + uniqueness check in worker.
- **Board + interaction (BOARD-01..10):** React board grid + keyboard/touch handlers + digit pad component.
- **Input modes (INPUT-*):** explicit `inputMode` state (`cell-first` / `number-first`) in store.
- **Annotations (ANNO-*):** per-cell candidate set representation in state.
- **Validation/Hints/Cheat flag (VALID-*, HINT-*, CHEAT-*):** worker-backed correctness checks + immutable cheated flag once set.
- **Save/resume (SAVE-*):** autosave after every mutation, resume prompt on app load.
- **Completion + timer (COMP-*, TIMER-*):** derived completion detection and visibility-aware timer lifecycle.
- **Best games (BEST-*):** persistent capped list sorted by elapsed time, clear confirmation, cheated badge.

---

## 8. Suggested Project Setup

- Scaffold: Vite React TypeScript template.
- Enable TypeScript strict settings.
- Add Tailwind CSS.
- Add Zustand, Zod, React Router.
- Add Vitest + RTL + Playwright.
- Add PWA plugin (optional but recommended).
- Configure CI to run lint + unit tests + e2e smoke.
- Configure GitHub Pages deployment workflow (`.github/workflows/deploy-pages.yml`) to build `dist/` and publish via `actions/deploy-pages`.

---

## 9. Deployment Profile (GitHub-native)

- **Source control and CI/CD:** GitHub repository + GitHub Actions.
- **Hosting:** GitHub Pages static site.
- **Build step:** `npm run build` with Vite base path supplied by `actions/configure-pages`.
- **Artifact:** `dist/` uploaded with `actions/upload-pages-artifact`.
- **Release trigger:** push to `main` (plus optional manual dispatch).

This profile keeps the application fully client-side and free to host while keeping code, automation, and delivery in a single platform.

---

## 10. Trade-offs and Alternatives

- **React + Zustand vs Redux Toolkit:** Zustand is lighter and sufficient for local app state.
- **Tailwind vs CSS modules:** Tailwind speeds UI implementation and consistency; CSS modules remain a valid alternative.
- **Web Worker optionality:** can be deferred initially, but should be introduced if generation/validation causes frame drops.

---

## 11. Final Recommendation

Adopt a **TypeScript + React + Vite + Zustand + Tailwind** stack, persist state in **`localStorage`** with **Zod-validated schemas**, and implement Sudoku generation/solving in a **Web Worker**. This combination best satisfies the functional requirements while keeping the app fully client-side, performant, and maintainable.
