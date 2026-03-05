# Architecture Overview

This document describes the main runtime and code boundaries for sudoku-4all.

## Goals
- Keep Sudoku logic deterministic and testable.
- Keep expensive generation/validation off the main thread.
- Keep UI behavior clear, accessible, and minimally stateful.
- Keep delivery fully static and GitHub-native (Actions + Pages).

## High-level flow
1. User interacts with pages/components in `src/features/*`.
2. UI dispatches actions to Zustand stores in `src/state/*`.
3. Stores coordinate domain logic from `src/domain/sudoku/*`.
4. Persistence helpers in `src/persistence/*` load/save session and best-game records.
5. Heavy tasks route through worker client in `src/workers/sudokuWorkerClient.ts` to `src/workers/sudokuWorker.ts`.

## Deployment architecture
- Hosting target: GitHub Pages static site.
- CI/CD pipeline: GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
- Build artifact: Vite `dist/` output uploaded with `actions/upload-pages-artifact`.
- Runtime base path: injected at build time via `actions/configure-pages` output.

Deployment flow:
1. Push to `main` triggers deploy workflow.
2. Workflow installs dependencies and runs `npm run build -- --base "${base_path}/"`.
3. Build artifact is uploaded and deployed using `actions/deploy-pages`.
4. GitHub Pages serves static assets globally.

## Module boundaries

### UI and feature layer
- `src/features/game/GamePage.tsx`: main gameplay screen and user flows.
- `src/features/best-games/BestGamesPage.tsx`: leaderboard/history view.
- `src/ui/*`: reusable presentational controls (digit pad, layout pieces).

Responsibilities:
- Render state from stores.
- Trigger store actions and worker calls.
- Keep rendering and interaction concerns separate from Sudoku rules.

### State layer (Zustand)
- `src/state/useGameStore.ts`: active session state, input mode, validation/hints, timer, completion.
- `src/state/useBestGamesStore.ts`: best-games records and management.

Responsibilities:
- Own mutation logic for app/session state.
- Enforce gameplay invariants at interaction boundaries.
- Keep state transitions predictable and testable.

### Domain layer (pure Sudoku logic)
- `src/domain/sudoku/engine.ts`: generation, solving, validation, difficulty handling.
- `src/domain/sudoku/types.ts`: domain types and contracts.

Responsibilities:
- Pure computation only (no browser APIs).
- Validate row/column/box constraints and puzzle invariants.
- Be heavily covered by unit tests.

### Persistence layer
- `src/persistence/storage.ts`: localStorage serialization and data guards.

Responsibilities:
- Read/write current game and best-game records.
- Keep schema/version handling robust.

### Worker layer
- `src/workers/messages.ts`: message contract types.
- `src/workers/sudokuWorker.ts`: worker-side heavy computations.
- `src/workers/sudokuWorkerClient.ts`: main-thread worker API wrapper.

Responsibilities:
- Isolate expensive operations from UI thread.
- Maintain clear request/response contracts.

## Data model (conceptual)
- In-progress session:
  - puzzle, solution, answers, annotations, hint locks
  - difficulty, elapsed time, input/annotation modes, cheated flag
- Best-game record:
  - difficulty, elapsed time, cheated, timestamp

## Testing strategy by layer
- Domain/state changes: unit/component-level tests under `src/**/*.test.ts(x)`.
- Page/interaction behavior: integration tests in feature test files.
- End-to-end user flows: Playwright tests in `tests/e2e/*`.

For each change, run all applicable layers based on impact:
1. Focused tests
2. `npm run test`
3. `npm run build`
4. `npm run test:e2e` (when user-visible flow is impacted)

## Design constraints
- Prefer small, targeted changes over broad refactors.
- Reuse existing patterns before introducing new abstractions.
- Avoid global styling changes when component-level Tailwind classes are sufficient.
- Keep behavior aligned with `spec/functional-spec.md` and `spec/technical-spec.md`.
