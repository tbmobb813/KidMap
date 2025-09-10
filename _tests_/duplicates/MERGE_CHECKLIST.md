# MERGE CHECKLIST — `_tests_/duplicates`

Summary
- This checklist records the recommended action for each merged duplicate test file discovered by the automated dedupe workflow. It points at the prepared patch artifacts, backups, and indicates whether the change is safe to auto-apply or requires manual review.

How to use
- Review the proposed patch files under `_tests_/duplicates/proposed_patches/` and the unified diffs (`*.patch`).
- For safe items, prefer a small branch + test run and open a PR. For Manual-Review items, inspect the `merge_diff_report_v4.json` entry and the original archive under `_tests_/duplicates/merged/`.

Per-file actions

- `components__AIJourneyCompanion.basic.test.tsx`
  - Status: SAFE → can delete merged archive
  - Location: `_tests_/duplicates/merged/components__AIJourneyCompanion.basic.test.tsx`
  - Action: backup + move to `_tests_/duplicates/discarded/` or remove from repo after confirmation.

- `components__AIJourneyCompanion.fixed.test.tsx`
  - Status: MANUAL-REVIEW
  - Reason: UniqueLinesInMerged: 18; non-trivial differences with canonical.
  - Suggested action: human merge; produce manual patch if agreed.

- `components__AIJourneyCompanion.simplified.test.tsx` and `misc__AIJourneyCompanion.simplified.test.tsx`
  - Status: MANUAL-REVIEW
  - Reason: Many unique lines; requires content-preserving merge.

- `components__OnboardingFlow.test.tsx`
  - Status: MANUAL-REVIEW (DO NOT AUTO-MERGE)
  - Reason: Large unique set (UniqueLinesInMerged: 118). User has edited this file manually—leave for a human reviewer.

- `components__routeCard.test.tsx` (canonical: `_tests_/core/routeCard.test.tsx`)
  - Status: PATCH PREPARED (SMALL)
  - Artifacts:
    - Patched file: `_tests_/duplicates/proposed_patches/routeCard.patched`
    - Unified diff: `_tests_/duplicates/proposed_patches/routeCard.patch`
    - Backup (original canonical copy): `_tests_/duplicates/proposed_patches/routeCard.backup`
    - Summary: `_tests_/duplicates/proposed_patches/routeCard_patch_summary.json`
  - Action: apply on a branch, run jest/lint/tsc, open PR. (A local branch `dedupe/routeCard-proposed-patch` exists in this workspace with the verification commits.)

- `telemetry.test.tsx` (canonical: `_tests_/critical/telemetry.test.tsx`)
  - Status: PATCH PREPARED (SMALL)
  - Artifacts:
    - Patched file: `_tests_/duplicates/proposed_patches/telemetry.patched`
    - Unified diff: `_tests_/duplicates/proposed_patches/telemetry.patch`
    - Summary: `_tests_/duplicates/proposed_patches/telemetry_patch_summary.json`
  - Action: apply on a branch, run jest/lint/tsc, open PR.

Other artifacts to inspect
- `merge_diff_report_v4.json` — comprehensive per-file diff report produced by the diff script.
- `merge_actions.json` — actionable summary generated from the diff report.

Recommended next steps (minimal, ordered)
1. Review diffs for `routeCard` and `telemetry` in `_tests_/duplicates/proposed_patches/`.
2. Remove temporary debug logs from `_tests_/core/routeCard.test.tsx` (if present) and finalize commits on the verification branch.
3. Run `npm run lint` and `npm run typecheck` locally; fix any issues.
4. Run `node ./.scripts/run-tests-and-log.js _tests_/core/routeCard.test.tsx _tests_/critical/telemetry.test.tsx` to produce verification logs.
5. Open a PR from the verification branch (or create a new branch) with the applied patches. Mark large items (OnboardingFlow, AIJourneyCompanion variants) as Manual-Review in the PR description and attach the unified diffs.

Notes
- No canonical tests were overwritten without creating backups and branch commits. Large/complex files were intentionally left for manual review.
- If you want me to open the PR and push the branch, say so and I will push the branch `dedupe/routeCard-proposed-patch` and open a PR with the patches and logs.

Timestamp: 2025-09-10T20:46:20Z
# Merge Checklist for `_tests_/duplicates/merged`

This checklist summarizes each archived merged test file, the declared canonical target (if found), whether the canonical exists, a short unique-lines sample, and a recommended action.

> Generated automatically on 2025-09-09 by the dedupe assistant. Review each item before applying changes.

## components__AIJourneyCompanion.basic.test.tsx

- Merged file: `_tests_/duplicates/merged/components__AIJourneyCompanion.basic.test.tsx`
- Declared canonical: `_tests_/core/AIJourneyCompanion.test.tsx` (extracted from header)
- Canonical exists: No (script did not find canonical at inferred path)
- Unique lines in merged: 90 (sample below)

```txt
// Archived: merged into `_tests_/core/AIJourneyCompanion.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
import { jest } from "@jest/globals";
import { render } from "@testing-library/react-native";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";
```

- Suggested action: Manual review — likely merge into `_tests_/core/AIJourneyCompanion.test.tsx` if canonical is incomplete, otherwise delete.

---

## components__AIJourneyCompanion.fixed.test.tsx

- Merged file: `_tests_/duplicates/merged/components__AIJourneyCompanion.fixed.test.tsx`
- Declared canonical: `_tests_/core/AIJourneyCompanion.test.tsx`
- Canonical exists: No
- Unique lines in merged: 203 (sample below)

```txt
// Archived: merged into `_tests_/core/AIJourneyCompanion.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
import { render } from "@testing-library/react-native";
import { Animated } from "react-native";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";
```

- Suggested action: Manual review and merge if canonical lacks animation or telemetry tests; otherwise delete.

---

## components__AIJourneyCompanion.simplified.test.tsx

- Merged file: `_tests_/duplicates/merged/components__AIJourneyCompanion.simplified.test.tsx`
- Declared canonical: `_tests_/core/AIJourneyCompanion.test.tsx`
- Canonical exists: No
- Unique lines in merged: 302 (sample below)

```txt
// Archived: merged into `_tests_/core/AIJourneyCompanion.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";
```

- Suggested action: Manual review and merge — this file contains async/API integration tests that should be preserved in canonical.

---

## misc__AIJourneyCompanion.simplified.test.tsx

- Merged file: `_tests_/duplicates/merged/misc__AIJourneyCompanion.simplified.test.tsx`
- Declared canonical: `_tests_/core/AIJourneyCompanion.test.tsx`
- Canonical exists: No
- Unique lines in merged: 203 (sample below)

```txt
// Archived: merged into `_tests_/core/AIJourneyCompanion.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
import { render } from "@testing-library/react-native";
import { Animated } from "react-native";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";
```

- Suggested action: Manual review and merge as above.

---

## components__routeCard.test.tsx

- Merged file: `_tests_/duplicates/merged/components__routeCard.test.tsx`
- Declared canonical: `_tests_/core/routeCard.test.tsx` (noted in header)
- Canonical exists: No (script did not locate it at inferred path)
- Unique lines in merged: 5 (sample below)

```txt
// Archived: merged into `_tests_/core/routeCard.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
// Duplicate archived. Use `_tests_/core/routeCard.test.tsx` for the canonical test.
// Original comprehensive content preserved at `components__routeCard.test.orig.tsx`.
```

- Suggested action: Manual review. If `_tests_/core/routeCard.test.tsx` exists and contains the canonical content, delete this archive; else merge from the `.orig` copy into canonical.

---

## components__OnboardingFlow.test.tsx

- Merged file: `_tests_/duplicates/merged/components__OnboardingFlow.test.tsx`
- Declared canonical: `_tests_/core/OnboardingFlow.test.tsx`
- Canonical exists: No
- Unique lines in merged: 136 (sample below)

```txt
// Archived: merged into `_tests_/core/OnboardingFlow.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.
/**
 * COMPREHENSIVE TEST SUITE: OnboardingFlow Component
 *
 * This component is COMPLEX with 243 lines, multi-step wizard workflow,
 * state management, region integration, and preferences handling. Requires thorough testing.
```
