# Skills Index

Use this index to quickly choose the right checklist for a change.

## By change type

- **UI styling or layout updates**
  - [tailwind-ui-changes.md](tailwind-ui-changes.md)
  - [ui-change-checklist.md](ui-change-checklist.md)

- **Feature-level UI behavior or interaction changes**
  - [ui-change-checklist.md](ui-change-checklist.md)
  - [vitest-rtl-testing.md](vitest-rtl-testing.md)
  - [playwright-e2e-guidelines.md](playwright-e2e-guidelines.md) (for flow-level impact)

- **Zustand store/state updates**
  - [zustand-store-changes.md](zustand-store-changes.md)
  - [vitest-rtl-testing.md](vitest-rtl-testing.md)

- **Sudoku rules, solving, generation, validation semantics**
  - [sudoku-domain-invariants.md](sudoku-domain-invariants.md)
  - [vitest-rtl-testing.md](vitest-rtl-testing.md)

- **Worker message contracts or heavy-compute routing**
  - [web-worker-contracts.md](web-worker-contracts.md)
  - [vitest-rtl-testing.md](vitest-rtl-testing.md)

- **Persistence/localStorage schema changes**
  - [persistence-schema-changes.md](persistence-schema-changes.md)
  - [zustand-store-changes.md](zustand-store-changes.md) (if store loading/saving behavior changes)

- **E2E flow changes across pages**
  - [playwright-e2e-guidelines.md](playwright-e2e-guidelines.md)

## Test-layer reminder
For every change, run all applicable layers based on impact:
1. Focused tests
2. `npm run test`
3. `npm run build`
4. `npm run test:e2e` (when user-visible flow is affected)

## Current skill files
- [ui-change-checklist.md](ui-change-checklist.md)
- [tailwind-ui-changes.md](tailwind-ui-changes.md)
- [zustand-store-changes.md](zustand-store-changes.md)
- [web-worker-contracts.md](web-worker-contracts.md)
- [sudoku-domain-invariants.md](sudoku-domain-invariants.md)
- [persistence-schema-changes.md](persistence-schema-changes.md)
- [vitest-rtl-testing.md](vitest-rtl-testing.md)
- [playwright-e2e-guidelines.md](playwright-e2e-guidelines.md)
