# Copilot Instructions for sudoku-4all

## Project intent
- Build and maintain a client-side Sudoku web app that follows `spec/functional-spec.md` and `spec/technical-spec.md`.
- Prioritize clarity, accessibility, and deterministic behavior over clever abstractions.
- Keep UX changes minimal and aligned with existing patterns.

## Tech stack
- TypeScript + React + Vite
- Zustand for app state
- Tailwind CSS for styling
- Vitest + Testing Library for unit/integration tests
- Playwright for end-to-end tests
- Web Worker for heavy Sudoku operations

## Architecture conventions
- Keep feature code under `src/features/*`.
- Keep Sudoku logic pure and testable under `src/domain/sudoku/*`.
- Keep app state logic in `src/state/*` and persistence in `src/persistence/*`.
- Keep worker contracts in `src/workers/messages.ts` and worker/client code in `src/workers/*`.
- Prefer small, focused components and functions over broad rewrites.

## Coding guidelines
- Use strict TypeScript-friendly patterns; avoid `any` unless unavoidable.
- Do not introduce new dependencies unless there is a clear, documented need.
- Reuse existing utility functions and store actions when possible.
- Avoid adding new global CSS rules unless necessary; prefer Tailwind utility classes.
- Do not hard-code non-system design values when existing tokens/utilities already cover the need.
- Keep naming descriptive and consistent with current files.

## Sudoku/domain rules
- Maintain Sudoku invariants (9x9 grid, digits 1-9, valid row/column/box constraints).
- Preserve existing behavior for cheating, validation, hints, resume/discard, and completion flows.
- Keep expensive generation/validation off the main thread where worker paths already exist.

## Testing and validation
- Add or update tests for behavior changes:
  - Add tests for UI behavior changes when possible.
  - Unit tests for domain/store logic.
  - Integration tests for page-level UI behavior.
  - E2E tests only for user-visible end-to-end flows.
- For every new change, run all applicable test layers (component/unit, integration, and E2E) based on impact.
- Run targeted tests first, then broader checks when changes are complete.
- Use these commands:
  - `npm run test`
  - `npm run build`
  - `npm run test:e2e`

## Change scope expectations
- Make surgical changes that directly satisfy the request.
- Do not refactor unrelated modules in the same PR.
- Preserve existing public behavior unless the request explicitly changes it.
- If requirements are ambiguous, choose the simplest implementation consistent with specs.

## Documentation expectations
- Update README or spec docs only when behavior or workflows change materially.
- Keep documentation concise and actionable.
