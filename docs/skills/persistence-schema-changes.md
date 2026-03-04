# Persistence Schema Changes (Skill)

Use this guide when updating data stored by `src/persistence/storage.ts`.

## Schema change rules
- Keep persisted structures explicit and version-aware.
- Prefer additive changes when possible to reduce migration risk.
- Do not silently break loading of older saved sessions.

## Backward compatibility
- Guard reads with validation checks before use.
- Provide safe defaults for missing fields.
- If a breaking shape change is required, add migration logic.

## Keys and ownership
- Keep storage keys centralized and stable.
- Avoid writing persistence logic directly in feature components.
- Route persistence through existing storage helpers and store flows.

## Failure handling
- Handle malformed or partial localStorage data gracefully.
- Ensure corrupted data does not crash game startup.
- Clear/repair invalid entries only when justified and explicit.

## Tests to add/update
- Unit tests for load/save behavior with old and new shapes.
- Store/integration tests for resume/discard and best-games behavior if affected.
- E2E tests only when persistence changes alter user-visible flows.

## Validation steps
1. Run focused persistence/store tests.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` when user-visible resume/history flows are impacted.
