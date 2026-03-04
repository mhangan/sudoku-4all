# Playwright E2E Guidelines (Skill)

Use this guide for tests in `tests/e2e/*`.

## What belongs in E2E
- Cross-page flows and key user journeys.
- Integration points that are hard to validate only with RTL.
- Do not duplicate all integration coverage in E2E.

## Selector strategy
- Prefer role- and label-based selectors.
- Avoid brittle CSS or text-only selectors when roles are available.
- Keep locators scoped to stable regions where possible.

## Reliability
- Avoid arbitrary sleeps.
- Wait on meaningful UI state transitions.
- Keep scenarios independent and deterministic.

## Scope discipline
- One test should validate one user goal.
- Keep setup concise; avoid overlong multi-goal scripts.
- Use mocks/stubs only when required by environment constraints.

## Validation steps
1. Run impacted integration tests first.
2. Run `npm run test:e2e`.
3. If behavior/code changed broadly, also run `npm run test` and `npm run build`.
