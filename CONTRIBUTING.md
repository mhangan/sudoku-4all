# Contributing to sudoku-4all

Thanks for contributing.

## Development setup
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Unit + integration tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Project structure
- `src/features/*`: page/feature UI code
- `src/domain/sudoku/*`: pure Sudoku logic
- `src/state/*`: Zustand stores and actions
- `src/persistence/*`: localStorage and persistence helpers
- `src/workers/*`: worker contracts/client/worker implementation

## Change expectations
- Keep changes focused and minimal.
- Reuse existing patterns and utilities before adding new abstractions.
- Avoid unrelated refactors in the same PR.
- Do not add new dependencies unless clearly necessary.
- Preserve Sudoku invariants and existing gameplay semantics.

## Testing policy
For every change, include and run all applicable layers:
- Component/unit tests for isolated logic and components
- Integration tests for page-level user behavior
- E2E tests for end-to-end user-visible flows

Run targeted tests first, then broader checks:
1. Relevant focused test file(s)
2. `npm run test`
3. `npm run build`
4. `npm run test:e2e` (when user-visible flow is affected)

## Pull requests
- Use the PR template and complete every section.
- Summarize behavior changes and why they were made.
- List exactly which tests were run.
- Include screenshots/GIFs for visible UI changes.
- Call out known limitations or follow-up work explicitly.
