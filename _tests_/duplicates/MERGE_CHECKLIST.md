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
