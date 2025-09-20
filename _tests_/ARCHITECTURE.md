# Test Architecture Standards - Phase 3

**Generated**: September 17, 2025  
**Version**: 3.0  
**Status**: Phase 3 Implementation

## Overview

This document establishes the standardized test architecture for KidMap following Phase 1 (deduplication), Phase 2 (template-based enhancement), and Phase 3 (architecture optimization).

## Directory Structure

### Primary Test Categories

```
_tests_/
├── critical/           # Security, safety, performance-critical tests
├── core/              # Component integration, user workflows  
├── infra/             # Infrastructure, hooks, utilities
├── misc/              # Experimental, variant, non-critical tests
├── duplicates/        # Archive for resolved duplicates
├── mergeable-to-review/ # Pending merge candidates (should be empty)
└── _templates_/       # Test templates for different patterns
```

### Category Guidelines

#### `critical/` - Always Run in CI

**Criteria**: Security, safety, core functionality, data integrity

- Authentication flows (`PinAuthentication.test.tsx`)
- Safety components (`SafetyDashboard.test.tsx`)
- Route services and caching (`routesCache.test.tsx`, `routePrefetch.test.tsx`)
- Telemetry and monitoring (`telemetry.test.tsx`)
- Error handling and recovery (`errorHandling.test.tsx`)

**Execution**: Fast, reliable, blocks PRs on failure

#### `core/` - Component Integration Tests

**Criteria**: UI components, user interactions, cross-component workflows

- Map and route UI (`RouteCard.test.tsx`, `SearchBar.test.tsx`)
- Navigation components (`OnboardingFlow.test.tsx`)
- Async UI components (`PhotoCheckIn.test.tsx`, `OptimizedImage.test.tsx`)
- Status indicators (`NetworkStatusBar.test.tsx`, `OfflineIndicator.test.tsx`)
- Common UI elements (`EmptyState.test.tsx`, `LoadingSpinner.test.tsx`)

**Execution**: Moderate speed, comprehensive coverage

#### `infra/` - Infrastructure & Utilities

**Criteria**: Hooks, utilities, theme system, configuration

- Theme system (`themeSystem.test.tsx`)
- Custom hooks (`hooks_*.test.tsx`)
- Utility functions and helpers
- Configuration and constants

**Execution**: Fast, foundational

#### `misc/` - Experimental & Variants

**Criteria**: Experimental features, multiple variants, non-critical

- AI features (`AIJourneyCompanion.test.tsx` variants)
- Experimental components
- Alternative implementations
- Performance benchmarks

**Execution**: Optional, can be skipped in fast CI

## Naming Conventions

### File Naming Standards

```
# Component tests
ComponentName.test.tsx

# Hook tests  
hooks_hookName.test.tsx

# Service/utility tests
serviceName.test.tsx

# Module-specific tests
moduleName_ComponentName.test.tsx

# Constants/configuration tests
constants_ConfigName.test.tsx
```

### Test Suite Structure

```typescript
describe("ComponentName", () => {
  // Setup and mocks
  beforeEach(() => {
    // Reset mocks and setup
  });

  describe("Basic Rendering", () => {
    // Basic render, crash, prop validation tests
  });

  describe("User Interactions", () => {
    // Click, tap, gesture handling tests  
  });

  describe("Conditional Rendering", () => {
    // State-based visibility, prop-driven rendering
  });

  describe("Props and State Variations", () => {
    // Different prop combinations, edge cases
  });

  describe("Loading and Error States", () => {
    // Async behavior, error handling
  });

  describe("Accessibility", () => {
    // Screen reader, keyboard navigation
  });

  describe("Integration Behavior", () => {
    // Cross-component interactions
  });

  describe("Edge Cases", () => {
    // Boundary conditions, null/undefined handling
  });

  describe("Regression Tests", () => {
    // Previously fixed bugs, specific scenarios
  });
});
```

## Template System

### Available Templates

```
_templates_/
├── ComponentTestTemplate.test.tsx.template    # Comprehensive component testing
├── BasicTestTemplate.test.tsx.template        # Simple component testing  
├── HookTestTemplate.test.tsx.template         # Custom hooks
├── ServiceTestTemplate.test.tsx.template      # Services and utilities
└── IntegrationTestTemplate.test.tsx.template  # Multi-component scenarios
```

### Template Selection Guidelines

- **Safety-critical components**: Use `ComponentTestTemplate` (comprehensive)
- **Simple presentational components**: Use `BasicTestTemplate`
- **Custom hooks**: Use `HookTestTemplate`  
- **Services/utilities**: Use `ServiceTestTemplate`
- **Multi-component flows**: Use `IntegrationTestTemplate`

### Template Application Process

1. Copy appropriate template to target location
2. Replace template placeholders with actual component/service names
3. Customize test cases for specific component behavior
4. Apply consistent mock patterns and setup
5. Ensure all template sections are properly implemented

## Mock Patterns

### Standardized Mocks

```typescript
// React Native components
jest.mock('react-native', () => require('@/mocks/react-native'));

// Navigation
jest.mock('@react-navigation/native', () => require('@/mocks/navigation'));

// Theme system
jest.mock('@/constants/theme', () => require('@/mocks/theme'));

// Store/state management
jest.mock('@/stores/[storeName]', () => require('@/mocks/stores/[storeName]'));

// External dependencies
jest.mock('lucide-react-native', () => require('@/mocks/lucide'));
jest.mock('expo-image-picker', () => require('@/mocks/expo-image-picker'));
```

### Mock Organization

```
__mocks__/
├── react-native.js         # Core RN components
├── expo-image-picker.js    # Expo modules
├── lucide-react-native.js  # Icon libraries
└── @/                      # Internal module mocks
    ├── stores/             # Store mocks
    ├── constants/          # Constants mocks
    └── components/         # Component mocks
```

## Test Execution Strategy

### CI Pipeline Stages

#### Stage 1: Critical (Fast Gate)

- **Target**: < 30 seconds
- **Pattern**: `_tests_/critical/**/*.test.*`
- **Trigger**: Every commit, PR creation
- **Failure**: Blocks merge

#### Stage 2: Core (Comprehensive)  

- **Target**: < 5 minutes
- **Pattern**: `_tests_/{critical,core}/**/*.test.*`
- **Trigger**: PR ready for review
- **Failure**: Blocks merge after review

#### Stage 3: Full (Complete Coverage)

- **Target**: < 15 minutes  
- **Pattern**: `_tests_/**/*.test.*`
- **Trigger**: Pre-merge, nightly builds
- **Failure**: Warning, manual review

### Local Development

```bash
# Critical tests only (fast feedback)
npm run test:critical

# Core functionality
npm run test:core  

# Full test suite
npm test

# Watch mode for active development
npm run test:watch

# Coverage reporting
npm run test:coverage
```

## Quality Standards

### Test Coverage Requirements

- **Critical components**: 90%+ coverage
- **Core components**: 80%+ coverage  
- **Infrastructure**: 85%+ coverage
- **Misc/experimental**: 60%+ coverage

### Code Quality Checks

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Test validation
npm run test:validate

# Full quality gate
npm run quality:check
```

### Performance Standards

- Individual test: < 1 second
- Test suite: < 100ms average per test
- No memory leaks in test execution
- Parallel execution where possible

## Migration Guidelines

### Existing Test Migration

1. **Identify current location and category**
2. **Apply appropriate template patterns**  
3. **Update imports to use path aliases (`@/`)**
4. **Standardize mock patterns**
5. **Ensure proper test organization**
6. **Validate in target CI stage**

### New Test Creation

1. **Select appropriate template**
2. **Follow naming conventions**
3. **Place in correct directory category**
4. **Apply standardized mock patterns**
5. **Implement required test sections**
6. **Validate coverage requirements**

## Maintenance Automation

### Automated Checks

- Duplicate test detection
- Template compliance validation
- Coverage threshold enforcement
- Performance regression detection
- Mock pattern consistency

### Regular Maintenance

- Weekly: Review test performance metrics
- Monthly: Validate coverage reports
- Quarterly: Update templates and standards
- Release: Full test suite validation

## Future Enhancements

### Phase 4 Considerations

- **Visual regression testing** for UI components
- **E2E test integration** with component tests  
- **Performance benchmark automation**
- **A/B testing infrastructure**
- **Cross-platform test validation**

---

**Next Steps**: Implement template expansion and CI integration per Phase 3 objectives.
