# Manual Review Required

This directory contains test files that require manual review before final disposition. These files were identified during the automated dedupe process as having significant unique content that cannot be safely auto-merged.

## Files requiring manual review

### AIJourneyCompanion Variants

- `components__AIJourneyCompanion.basic.test.tsx` - Basic test variant (90 unique lines)
- `components__AIJourneyCompanion.fixed.test.tsx` - Fixed variant with animation tests (203 unique lines)  
- `components__AIJourneyCompanion.simplified.test.tsx` - Simplified variant with async/API tests (302 unique lines)
- `misc__AIJourneyCompanion.simplified.test.tsx` - Another simplified variant (203 unique lines)

**Canonical location:** `_tests_/core/AIJourneyCompanion.test.tsx` (368 lines - comprehensive)

**Action needed:** Compare these variants with the canonical test to identify:

- Missing test cases that should be added to canonical
- Duplicate tests that can be discarded
- Better mocking patterns that could improve canonical

### OnboardingFlow Variants

- `components__OnboardingFlow.test.tsx` - Comprehensive test suite (148 lines) with multi-step wizard tests
- `OnboardingFlow.mergeable.test.tsx` - Simpler merged variant (127 lines)

**Canonical location:** `_tests_/core/OnboardingFlow.test.tsx` (38 lines - basic)

**Action needed:** The canonical is very basic. Review these variants for:

- Complete onboarding flow testing
- Region selection testing  
- State management testing
- Multi-step navigation testing

### Telemetry Variant

- `telemetry.mergeable.test.tsx` - Alternative telemetry test variant (162 lines)

**Canonical location:** `_tests_/critical/telemetry.test.tsx` (154 lines - patched)

**Action needed:** Compare with canonical to see if this variant has unique test cases worth preserving.

## Process for manual review

1. **Compare content:** For each file, compare with the canonical version to identify unique valuable content
2. **Extract improvements:** If the variant has better test coverage or patterns, extract those improvements
3. **Update canonical:** Apply improvements to the canonical test file
4. **Validate:** Run tests to ensure canonical works correctly
5. **Archive:** Move reviewed files to `_tests_/duplicates/archived/` once processed

## Files processed

- ✅ `components__routeCard.test.tsx` - Patch applied to canonical, archived
- ✅ `telemetry.test.tsx` - Patch applied to canonical, archived  
- ✅ `components__AIJourneyCompanion.basic.test.tsx` - Moved to archived/ (safe to delete per checklist)

## Note

The canonical AIJourneyCompanion test is already quite comprehensive (368 lines). The OnboardingFlow canonical is minimal (38 lines) and likely needs enhancement from the variants.

Created: 2025-09-18
