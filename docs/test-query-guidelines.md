# Test Query Guidelines

This short doc codifies the preferred query strategy for tests and when to use
the renderer-agnostic icon helper.

Preferred query order (most to least stable):

- a11y label / role (getByA11yLabel / getByA11yRole)
- visible text (getByText)
- semantic queries (getByPlaceholderText, getByDisplayValue)
- testID (getByTestId) — use sparingly

When testing icons:

- Prefer adding a stable `accessibilityLabel` and `accessibilityRole` to the
  interactive control that contains the icon (e.g., a Pressable).  Use
  constants exported from `constants/a11yLabels.ts` to avoid string drift.
- If a11y labels are not possible (legacy code, external libs), use the
  fallback helper `hasRenderedIcon(renderResult, iconName)` exported from
  `_tests_/testUtils.tsx`. This helper inspects the renderer-agnostic
  serialized tree to detect icon markers; use it sparingly and document the
  reason in the test.

Migration notes:

- Add a `// TODO: replace with a11y label and remove when all references migrated`
  comment near existing `testID` markers to help reviewers during migration.
- Migrate high-impact tests first (voice toggle, primary actions) and run the
  full quality gates after each batch (lint → typecheck → tests).
