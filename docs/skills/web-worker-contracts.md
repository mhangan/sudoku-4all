# Web Worker Contracts (Skill)

Use this guide for changes in `src/workers/*` and worker message contracts.

## Contract rules
- Keep request/response shapes explicit and version-safe.
- Update `src/workers/messages.ts` first when changing payloads.
- Ensure client and worker stay in sync in the same change.

## Error and fallback behavior
- Handle worker failures gracefully in client wrappers.
- Keep UI responsive if worker calls fail (fallback path remains functional).
- Do not leak worker internals into feature components.

## Performance constraints
- Keep heavy generation/validation on worker thread.
- Avoid moving expensive Sudoku computations back to main thread.

## Tests to add/update
- Unit tests for worker/client message handling when contracts change.
- Integration tests for user-visible behavior that depends on worker responses.
- E2E only if end-to-end flow semantics changed.

## Validation steps
1. Run focused tests for changed worker/client files.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` when UI flow is impacted.
