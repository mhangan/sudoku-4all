# Sudoku Domain Invariants (Skill)

Use this guide when changing `src/domain/sudoku/*` or gameplay rules.

## Core invariants
- Grid is always 9x9 (81 cells).
- Digits are in range 1..9; empty cells use 0.
- Row, column, and 3x3 box constraints must remain valid for solved states.

## Gameplay invariants
- Given cells are immutable.
- Hint-locked cells are immutable.
- Completion is true only when answers match solution fully.
- Cheat flag semantics remain consistent with validate/hint flows.

## Difficulty and generation
- Preserve difficulty-level behavior and clue expectations.
- Keep solver/generator deterministic enough for stable tests where required.
- Maintain uniqueness checks where implemented.

## Validation semantics
- Validation marks incorrect entries accurately.
- Correct entries clear relevant validation state.
- Annotation behavior must not corrupt answer values.

## Tests to add/update
- Domain unit tests for rule and solver/generator changes.
- Store tests where rule changes alter state transitions.
- Integration tests if user-visible behavior changes.

## Validation steps
1. Run focused domain/store tests.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` when gameplay flow behavior is visible to users.
