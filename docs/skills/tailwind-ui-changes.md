# Tailwind UI Changes (Skill)

Use this checklist for styling or layout updates in feature/UI components.

## Design consistency
- Reuse existing Tailwind utility patterns already used in the app.
- Prefer utility-class changes in component files over global CSS updates.
- Keep visual changes minimal and aligned with current look and feel.
- Do not introduce new color systems, fonts, or shadow patterns unless required.

## Accessibility and interaction
- Preserve semantic elements and accessible names.
- Keep focus visibility and keyboard interactions intact.
- Ensure disabled states remain understandable and visible.
- Keep contrast acceptable for text and status cues.

## Responsiveness
- Verify behavior at small and large breakpoints.
- Avoid layout shifts that break board controls or side panels.
- Preserve spacing rhythm with existing utility scales.

## Testing expectations
- Add/update integration tests for user-visible behavior changes when possible.
- Add E2E coverage only for key flow-level UI changes.
- Keep assertions tied to accessible roles/labels and visible behavior.

## Validation steps
1. Run focused feature test files.
2. Run `npm run test`.
3. Run `npm run build`.
4. Run `npm run test:e2e` when the change affects user-visible flow.
