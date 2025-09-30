# Test Templates System

This directory contains reusable test templates for KidMap React Native components.

## Available Templates

### 1. **ComponentTestTemplate.test.tsx** - Comprehensive Testing

- **Use for:** Critical, complex components requiring thorough validation
- **Coverage:** 26+ tests across 13 categories
- **Time Investment:** Medium-High
- **Examples:** SmartNotification, ParentDashboard, CategoryManagement

### 2. **BasicTestTemplate.test.tsx** - Essential Testing

- **Use for:** Simple components needing quick validation
- **Coverage:** 7 essential tests
- **Time Investment:** Low
- **Examples:** LoadingSpinner, SimpleButton, basic UI components

## Quick Start

1. **Choose your template** based on component complexity (see TemplateUsageGuide.md)
2. **Copy the appropriate template**
3. **Replace placeholders:**
   - `COMPONENT_NAME` → Your actual component name
   - Update import paths
   - Customize props and mocks
4. **Run tests** to ensure they work with your component

## Template Success Rate

✅ **SmartNotification**: 26/26 tests passing (Comprehensive Template)  
✅ **ParentDashboard**: 11/11 tests passing (Comprehensive Template)  
🔄 **CategoryManagement**: 9/14 tests (Flow issues resolved)

## Files

- `ComponentTestTemplate.test.tsx` - Full comprehensive testing template
- `BasicTestTemplate.test.tsx` - Streamlined essential testing template  
- `TemplateUsageGuide.md` - Decision guide and usage examples
- `LoadingSpinner.basic.example.test.tsx` - Basic template usage example

## Usage Tips

### For Basic Template

- Keep it minimal (7 core tests)
- Focus on crash prevention and essential functionality
- Perfect for UI components, wrappers, utilities

### For Comprehensive Template

- Use all 13 test categories
- Add component-specific edge cases
- Essential for safety-critical and complex components

### 3. **ServiceTestTemplate.test.tsx** - Service/Utility Testing

- **Use for:** Services, utilities, validation, and store logic
- **Coverage:** 20+ tests, edge cases, error paths
- **Examples:** SafeAsyncStorage, validation helpers, regionUtils

### 4. **HookTestTemplate.test.tsx** - Custom Hook Testing

- **Use for:** Custom hooks, store hooks, effect logic
- **Coverage:** 10+ tests, state transitions, effect validation
- **Examples:** useSafeZoneMonitor, useGlobalToast

### 5. **IntegrationTestTemplate.test.tsx** - Multi-Component/Workflow Testing

- **Use for:** Multi-component flows, integration scenarios
- **Coverage:** 15+ tests, workflow, error handling
- **Examples:** OnboardingFlow, route workflow, telemetry

## Integration with KidMap

These templates work seamlessly with:

- ✅ Existing Jest configuration
- ✅ `createTestWrapper` utility in `testUtils.tsx`
- ✅ React Native Testing Library patterns
- ✅ Lucide React Native icon mocking
- ✅ Theme provider testing
- ✅ Store and hook mocking patterns

## Next Steps

Apply these templates to remaining KidMap components:

✅ **SafeAsyncStorage**: 21/21 tests passing (Service Template)
✅ **useSafeZoneMonitor**: 12/12 tests passing (Hook Template)
✅ **OnboardingFlow**: 18/18 tests passing (Integration Template)

## Migration & Compliance Status

All legacy and new tests are being migrated to template-based files. See `TEST_CATALOG.md` for up-to-date coverage and canonical test locations. Migration progress and consolidation patterns are tracked in `MERGE_COMPLETION_REPORT.md` and `TEST_ARCHITECTURE_ANALYSIS.md`.

**Directory Structure:**

```
_tests_/
├── critical/           # Security, safety, performance-critical tests
├── core/               # Component integration, user workflows  
├── infra/              # Infrastructure, hooks, utilities
├── misc/               # Experimental, variant, non-critical tests
├── duplicates/         # Archive for resolved duplicates
├── mergeable-to-review/# Pending merge candidates
└── _templates_/        # Test templates for different patterns
```

**Naming & Compliance:**

- All new and migrated tests use describe/it patterns, import order, and mocking strategies from templates.
- Template compliance is enforced in CI and PR review.
- Canonical test locations and coverage tracked in `TEST_CATALOG.md`.

## Expanded Template Usage

Templates are now used for:

- Component tests
- Service/utility tests
- Store and validation tests
- Custom hooks
- Integration/multi-component workflows

1. **VirtualPetCompanion** (Comprehensive - complex interactions)
2. **RouteCard** (Comprehensive - critical navigation)  
3. **DirectionStep** (Basic - simple display component)
4. **EmptyState** (Basic - static UI component)
