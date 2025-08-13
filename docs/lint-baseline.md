# ESLint Baseline Workflow

We use a baseline gate so existing lint debt doesn't block development, while preventing *new* issues.

## Key Scripts

- `npm run lint:baseline` – Regenerates `.eslint-baseline.json` capturing current violations. Only run intentionally (e.g., after a targeted cleanup) – **never** casually.
- `npm run lint:ci` – Runs ESLint and fails only on violations not present in the baseline (with ±5 line drift tolerance).
- `npm run lint:summary` – Aggregated rule frequency (helps pick next cleanup focus).
- `npm run lint` – Full lint (all issues, regardless of baseline) with current severities.

## Pre-Commit

The Husky pre-commit hook runs `lint:ci` so a commit introducing new violations is blocked.

Additional details:

- Only staged files are linted for autofix (`lint-staged`), but `lint:ci` still analyzes the whole tree to catch cross-file regressions.
- If you intentionally refactor and resolve existing baseline issues, either (a) delete just those entries from `.eslint-baseline.json` or (b) regenerate the baseline (rare; see guidance below).
- Never bypass the hook with `--no-verify` unless CI is red for an unrelated, already-tracked issue and you have explicit approval.

## Cleanup Strategy

1. Pick one rule (e.g., `react-native/no-color-literals`).
2. Fix a focused subset (e.g., only in `components/`).
3. Run `npm run lint:ci` – should pass (no *new* issues).
4. Manually delete resolved entries for that rule from `.eslint-baseline.json` (so future reintroduction of those specific patterns fails), or regenerate the baseline if you cleared a large coherent chunk.
5. Commit both code changes and adjusted baseline.

## Do NOT

- Regenerate the baseline without reviewing the diff.
- Commit a regenerated baseline that *adds* new violations. (CI will allow it, but review standards should reject.)

## Tightening Over Time

We can gradually re-enable stricter severities by directory-specific overrides (e.g., enforce `@typescript-eslint/no-explicit-any` as `error` under `src/core/**`). Adjust baseline entries accordingly.

## Line Drift Tolerance

Lines shifted by small edits (±5) still match baseline entries. Large refactors may cause entries to show up as new; after a big refactor, regenerate or prune stale entries.

## FAQ

**Q:** How to see only new failures locally?  
**A:** `npm run lint:ci` (fast; minimal output if clean).

**Q:** How to fully view debt?  
**A:** `npm run lint` or inspect `.eslint-baseline.json`.

**Q:** Accidentally fixed many issues—baseline now inaccurate?  
**A:** Prefer manually removing obsolete entries; regenerate only if >20% of baseline entries were removed and diff reviewed.
