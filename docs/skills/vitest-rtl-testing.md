# Vitest + RTL Testing (Skill)

Use this guide for tests under `src/**/*.test.ts(x)`.

## Query and assertion strategy
- Prefer accessible queries (`getByRole`, `getByLabelText`) over brittle selectors.
- Scope queries with `within(...)` for repeated UI patterns.
- Assert user-visible outcomes rather than implementation details.

## Interaction patterns
- Use `userEvent` for realistic interactions.
- Keep test setup minimal and explicit.
- Mock only external boundaries (worker client, browser dialogs) when needed.

## Stability rules
- Avoid timing assumptions; use `waitFor`/`findBy*` for async UI.
- Keep fixtures deterministic.
- Test one behavior per scenario where practical.

## Coverage expectations
- UI behavior changes: add/adjust integration tests when possible.
- Domain/store changes: add focused unit tests.
- Keep assertions aligned with actual UX and accessibility labels.

## Validation steps
1. Run focused test file(s).
2. Run `npm run test`.
3. Run `npm run build`.
