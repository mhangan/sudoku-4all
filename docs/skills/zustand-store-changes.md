# Zustand Store Changes (Skill)

Use this guide when updating `src/state/*` stores.

## Scope
- Keep actions small and focused.
- Avoid unrelated state refactors in the same change.
- Keep behavior aligned with `spec/functional-spec.md` and `spec/technical-spec.md`.

## Store design
- Prefer explicit action names over generic mutators.
- Keep immutable update patterns predictable.
- Avoid storing derived values when they can be computed cheaply in selectors/components.
- Keep side effects out of the store when possible (except controlled persistence hooks already in use).

## Selectors and rendering
- Read only needed slices in components.
- Avoid broad selectors that trigger unnecessary re-renders.
- Keep UI-facing state and domain state boundaries clear.

## Tests to add/update
- Unit tests for each changed action path:
  - success path
  - guard/early-return path
  - edge cases for selected cell, modes, completion flags
- Integration tests when store behavior is user-visible in a page flow.

## Validation steps
1. Run focused store test files.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` if user-visible flow changed.
