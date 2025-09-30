# Test catalog (draft)

This file is a draft inventory and recommendation for the repository's test coverage and canonical locations.

## Summary

 Indexed (approx): 238 tests across `_tests_` (critical, core, infra, misc, duplicates).
 All new and migrated tests use template-based patterns (see `_templates_/README.md`).
 Legacy tests are being migrated and consolidated; see `MERGE_COMPLETION_REPORT.md` for progress.
 Template compliance is enforced in CI and PR review.
 Found several duplicate subjects; see `dedupe-report.json` for a machine-friendly listing.

## Priority: Extensive (critical)

Place these under `_tests_/critical/` and run them in CI gate.

 Run `npm run test:core` and check coverage meets threshold.
 Ensure all tests use template-based patterns and correct directory.

## Priority: Intermediate (core)

Place these under `_tests_/core/`.

- Map and route UI: `RouteCard`, `SearchBar`, `MapPlaceholder`, `SmartRouteSuggestions`, `LiveArrivalsCard`.
- Async UI components and conditional renderers: `PhotoCheckIn*`, `OptimizedImage`, `OfflineIndicator`, `NetworkStatusBar`.
- Hooks with side-effects not already in critical: other hook tests under `_tests_/hooks/`.

## Priority: Basic (smoke)

Place these under `_tests_/core/` or `_tests_/misc/` depending on stability.

- Simple presentational components: `AchievementBadge`, `AccessibleButton`, `CategoryButton`, `EmptyState`.
- Misc experimental or variant tests: `AIJourneyCompanion.*` (consolidate or move to `_tests_/misc/`).

## Duplicate handling recommendations

1. Use `dedupe-report.json` to identify subjects with multiple test files.
2. For each subject:
   - Pick a canonical path (prefer `_tests_/critical` for infra/security, `_tests_/core` for component integration).
   - Merge unique assertions into the canonical file.
   - Delete or mark duplicates with `test.skip` and add a TODO linking to the canonical test.

## Quick PR checklist for consolidation

- Run `npm run lint` and `npm run typecheck`.
- Run `npm run test:critical` to validate critical functionality.
- Create branch `chore/test-dedupe` and perform merges per subject.
- Add `_tests_/TEST_CATALOG.md` to the PR for reviewer context.

## Next steps I can do for you

1. Produce an expanded CSV/JSON mapping every test file to: top-level describe, imported component/service names, approximate lines, and last modification time.
2. Generate a suggested consolidation PR draft (non-destructive): copy canonical files into a `consolidation/` folder and leave duplicates untouched for review.

If you'd like me to continue, tell me which next step to run (1 or 2) or let me produce the full CSV map now.
