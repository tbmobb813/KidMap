# KidMap Testing - What's Left To Do

Based on our analysis of the KidMap project, here's what has been completed and what still needs attention:

## ✅ COMPLETED

### 1. Helper Files Infrastructure

- ✅ **mockAsyncStorage.ts** - Comprehensive AsyncStorage mock with realistic data
- ✅ **mockTripData.ts** - Trip data, user progression, places, routes mocks
- ✅ **renderWithProviders.tsx** - Enhanced render utilities with all providers
- ✅ **index.ts** - Central export file for easy importing
- ✅ **README.md** - Comprehensive documentation and usage guide
- ✅ **helpersUsageExample.test.tsx** - Example showing all helper usage patterns

### 2. Wired Up Test Files

- ✅ **ParentDashboard.test.tsx** - Updated to use new helpers
- ✅ **gamificationStore.test.ts** - Fixed and enhanced with mock data
- ✅ **SafeZoneManager.test.tsx** - Updated with helpers and added new tests
- ✅ **safeZoneAlerts.test.ts** - Partially updated (AsyncStorage mock)

## 🔄 IN PROGRESS / NEEDS ATTENTION

### 1. Test File Updates Needed

The following test files still use basic `render()` calls and inline mocks instead of our helpers:

#### **High Priority** (Direct render() usage)

- `__tests__/screens/MapScreen.test.tsx` (5 render calls)
- `__tests__/screens/RouteDetailScreen.test.tsx` (3 render calls)
- `__tests__/utils/devicePing.test.tsx` (4 render calls)
- `__tests__/errorScenarios/safetyErrorScenarios.test.tsx` (4 render calls)
- `__tests__/integration/AppFlow.integration.test.tsx` (3 render calls)
- `__tests__/integration/safetySystem.integration.test.tsx` (2 render calls)

#### **Medium Priority** (Inline AsyncStorage mocks)

- `__tests__/errorScenarios/safetyErrorScenarios.test.tsx` - Has inline AsyncStorage mock
- `__tests__/utils/safeZoneAlerts.test.ts` - Partially updated, needs completion
- `__tests__/integration/AppFlow.integration.test.tsx` - Uses basic AsyncStorage mock
- `__tests__/integration/safetySystem.integration.test.tsx` - Uses basic AsyncStorage mock

### 2. Store Test Issues

- **gamificationStore.test.ts** - Fixed main issues but may need more coverage of actual store methods
- Need to add tests for other stores:
  - `navigationStore.ts`
  - `parentalControlStore.ts`
  - `regionStore.ts`
  - `categoryStore.ts`

### 3. Type Issues to Fix

From error analysis:

- `react-test-renderer` types missing (need `@types/react-test-renderer`)
- Some store method calls don't match actual implementation

## 📋 TODO LIST

### Immediate Actions (High Impact)

1. **Update remaining test files to use helpers** (Priority: High)

   ```bash
   # Files to update:
   - __tests__/screens/MapScreen.test.tsx
   - __tests__/screens/RouteDetailScreen.test.tsx
   - __tests__/utils/devicePing.test.tsx
   - __tests__/errorScenarios/safetyErrorScenarios.test.tsx
   ```

2. **Install missing dependencies** (Priority: High)

   ```bash
   npm install --save-dev @types/react-test-renderer
   ```

3. **Fix gamification store test** (Priority: Medium)
   - Remove references to non-existent methods (`addExperience`, `completeQuest`, `quests`)
   - Focus on actual store methods: `addPoints`, `unlockAchievement`, `completeTrip`, etc.

### Systematic Migration Process

For each remaining test file, follow this pattern:

#### Before (Example):

```typescript
import { render } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const { getByText } = render(<Component />);
```

#### After:

```typescript
import { renderWithProviders, setupKidMapTests } from '../helpers';

beforeEach(() => {
  setupKidMapTests();
});

const { getByText } = renderWithProviders(<Component />);
```

### Store Testing Expansion

Create comprehensive tests for remaining stores:

1. **navigationStore.test.ts**

   ```typescript
   import { mockPlaces, mockRoutes } from '../helpers/mockTripData'
   // Test navigation state, route planning, etc.
   ```

2. **parentalControlStore.test.ts**

   ```typescript
   import { mockSafeZones, mockSafetyContacts } from '../helpers'
   // Test parental controls, safe zones, contacts
   ```

3. **regionStore.test.ts**
   ```typescript
   // Test region switching, API keys, transit data
   ```

### Integration Testing Enhancement

1. **Create comprehensive integration tests** using our helpers:

   ```typescript
   import {
     renderWithAllProviders,
     mockAsyncStorageInstance,
     mockDataSets,
   } from '../helpers'

   // Test full user flows with realistic data
   ```

2. **End-to-end user journey tests**:
   - New user onboarding flow
   - Trip planning and completion
   - Achievement unlocking
   - Safe zone management

### Documentation and Maintenance

1. **Update existing README files** to reference new helpers
2. **Create test coverage reports** to identify gaps
3. **Add continuous integration** to run helper-based tests
4. **Create test templates** for new features

## 🎯 PRIORITIES

### Week 1: Core Infrastructure

1. ✅ Helper files completed
2. Update 6 high-priority test files to use helpers
3. Fix type issues and dependencies

### Week 2: Store Testing

1. Complete store test coverage
2. Fix gamification store test issues
3. Add tests for remaining stores

### Week 3: Integration & Polish

1. Enhance integration tests with helpers
2. Create comprehensive end-to-end tests
3. Documentation updates

## 🚀 BENEFITS AFTER COMPLETION

Once all tests are migrated to use the helpers:

- **Consistency**: All tests use the same realistic mock data
- **Maintainability**: Changes to mock data happen in one place
- **Reliability**: Better error simulation and edge case coverage
- **Speed**: Faster test development with reusable patterns
- **Quality**: More comprehensive test coverage with realistic scenarios

## 🔧 QUICK MIGRATION SCRIPT

For rapid migration, you could create a script to automatically update basic patterns:

```bash
# Find and replace common patterns
find __tests__ -name "*.test.tsx" -exec sed -i 's/import { render }/import { renderWithProviders as render }/g' {} \;
```

But manual review is recommended to ensure proper helper usage and add `setupKidMapTests()` calls.

---

**Current Status**: 🟡 **In Progress** - Core helpers complete, ~40% of tests migrated

**Next Step**: Update the 6 high-priority test files to use `renderWithProviders` and `setupKidMapTests()`
