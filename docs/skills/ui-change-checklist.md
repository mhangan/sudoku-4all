# UI Change Checklist (Skill)

Use this checklist whenever you modify visible behavior or styling.

## 1) Scope and intent
- Confirm the exact UX requirement.
- Prefer the smallest implementation that satisfies it.
- Keep consistency with existing Tailwind patterns and component style.

## 2) Implementation constraints
- Do not introduce new design systems or hard-coded theme values without need.
- Avoid global CSS changes unless component-level classes cannot solve it.
- Preserve accessibility (focus behavior, labels, button states, semantics).

## 3) Test updates
Add or update tests when possible:
- Component/unit: isolated behavior and rendering logic
- Integration: user interactions at page level
- E2E: complete user flow only when behavior is user-visible across pages

Examples for this project:
- Digit pad visual/state behavior: integration test in `src/features/game/GamePage.test.tsx`
- Pure Sudoku rules/logic: unit tests in `src/domain/sudoku/*.test.ts`

## 4) Validation flow
1. Run focused tests for modified areas.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` for user-visible flow changes.

## 5) PR readiness
- Document visible behavior changes clearly.
- Attach screenshot/GIF for UI changes.
- Record exactly which tests were run.
