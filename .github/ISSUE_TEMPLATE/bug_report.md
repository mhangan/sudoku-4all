---
name: Bug report
about: Report a defect in gameplay, UI, persistence, or tests
labels: bug
---

## Summary
Describe the bug clearly and concisely.

## Environment
- OS:
- Browser:
- App version/commit:

## Steps to reproduce
1.
2.
3.

## Expected behavior
What should happen?

## Actual behavior
What happened instead?

## Scope
- [ ] Gameplay logic (`src/domain/sudoku/*`)
- [ ] UI behavior (`src/features/*`, `src/ui/*`)
- [ ] State/persistence (`src/state/*`, `src/persistence/*`)
- [ ] Worker path (`src/workers/*`)
- [ ] Tests/CI only

## Evidence
- Screenshot/GIF/logs (if applicable)
- Console/network errors (if any)

## Regression checks
If you prepared a fix, include which checks were run:
- [ ] Focused test file(s)
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (if user-visible flow impacted)
