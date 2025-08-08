# KidMap Test Helpers

This directory contains comprehensive testing utilities for the KidMap application. These helpers provide mock data, rendering utilities, and common test patterns to make testing easier and more consistent.

## Quick Start

```typescript
import { setupKidMapTests, renderWithProviders } from '../helpers';

describe('My Component Tests', () => {
  beforeEach(() => {
    setupKidMapTests(); // Sets up all mocks and defaults
  });

  it('should render component', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

## Available Helpers

### 1. AsyncStorage Mock (`mockAsyncStorage.ts`)

Comprehensive AsyncStorage mock with realistic data and failure simulation.

```typescript
import {
  setupMockAsyncStorage,
  mockAsyncStorageInstance,
  STORAGE_KEYS,
  getMockUserStats,
} from '../helpers/mockAsyncStorage'

// Basic setup
setupMockAsyncStorage()

// Access mock data
const userStats = getMockUserStats()

// Set custom data
mockAsyncStorageInstance.setStorageData({
  [STORAGE_KEYS.USER_STATS]: JSON.stringify(customStats),
})

// Simulate failures
mockAsyncStorageInstance.setFailureMode(true, new Error('Storage error'))
```

**Features:**

- Pre-populated with realistic KidMap data
- Storage keys constants for consistency
- Failure simulation for error testing
- Helper functions for common data types
- Full AsyncStorage API support

### 2. Trip Data Mocks (`mockTripData.ts`)

Mock trip data, routes, places, and user progression for testing.

```typescript
import {
  mockTripData,
  createMockTripData,
  mockUserStatsProgression,
} from '../helpers/mockTripData'

// Use predefined trips
const walkingTrip = mockTripData.walkingTrip

// Create custom trip
const customTrip = createMockTripData({
  destination: 'Custom Place',
  mode: 'transit',
  safety: 4,
})

// Different user levels
const beginnerStats = mockUserStatsProgression.beginner
const expertStats = mockUserStatsProgression.advanced
```

**Available Mock Data:**

- `mockTripData` - Various trip scenarios
- `mockTripJournal` - Trip journal entries
- `mockPlaces` - Common places
- `mockRoutes` - Navigation routes
- `mockUserStatsProgression` - User levels (beginner, intermediate, advanced)

### 3. Render Utilities (`renderWithProviders.tsx`)

Enhanced render functions with proper provider setup.

```typescript
import {
  renderWithProviders,
  renderWithNavigation,
  renderWithAllProviders
} from '../helpers/renderWithProviders';

// Basic render with SafeAreaProvider
const { getByText } = renderWithProviders(<Component />);

// With navigation for routing tests
const result = renderWithNavigation(<NavigationComponent />);

// Full setup for integration tests
const result = renderWithAllProviders(<FullAppComponent />);
```

**Available Renders:**

- `renderWithProviders` - Basic providers (SafeArea, Stores)
- `renderWithNavigation` - Adds NavigationContainer
- `renderWithQuery` - Adds React Query
- `renderWithAllProviders` - All providers for integration tests

### 4. Safe Zone Helpers (`safeZoneTestHelpers.ts`)

Utilities for testing safe zone functionality.

```typescript
import {
  fillSafeZoneForm,
  createMockZone,
  mockSuccessfulSafeZoneAPI,
} from '../helpers/safeZoneTestHelpers'

// Fill safe zone form
fillSafeZoneForm(renderResult, {
  name: 'School',
  latitude: '40.7128',
  longitude: '-74.0060',
  radius: '150',
})

// Create mock zone
const zone = createMockZone({ name: 'Home', radius: 100 })

// Mock API responses
const mockAPI = mockSuccessfulSafeZoneAPI()
```

### 5. General Test Utilities (`testUtils.tsx`)

Common mocks and utilities used across tests.

```typescript
import {
  mockSpeechEngine,
  mockGamificationStore,
  setupMocks,
} from '../helpers/testUtils'

// Setup all common mocks
setupMocks()

// Access individual mocks
expect(mockSpeechEngine.speak).toHaveBeenCalled()
```

## Testing Patterns

### Component Testing

```typescript
import { renderWithProviders, fireEvent, waitFor } from '../helpers';

describe('MyComponent', () => {
  beforeEach(() => {
    setupKidMapTests();
  });

  it('should handle user interaction', async () => {
    const { getByText } = renderWithProviders(<MyComponent />);

    fireEvent.press(getByText('Button'));

    await waitFor(() => {
      expect(getByText('Expected Result')).toBeTruthy();
    });
  });
});
```

### Store Testing

```typescript
import { mockTripData, setupMockAsyncStorage } from '../helpers'

describe('MyStore', () => {
  beforeEach(() => {
    setupMockAsyncStorage()
  })

  it('should handle trip completion', () => {
    const { completeTrip } = useMyStore.getState()

    act(() => {
      completeTrip(mockTripData.walkingTrip)
    })

    // Assert state changes
  })
})
```

### Integration Testing

```typescript
import {
  renderWithAllProviders,
  mockAsyncStorageInstance,
  STORAGE_KEYS,
  mockUserStatsProgression
} from '../helpers';

describe('App Integration', () => {
  it('should work end-to-end', async () => {
    // Setup initial state
    mockAsyncStorageInstance.setStorageData({
      [STORAGE_KEYS.USER_STATS]: JSON.stringify(mockUserStatsProgression.intermediate)
    });

    // Render full app
    const { getByText } = renderWithAllProviders(<App />);

    // Test user flow
    fireEvent.press(getByText('Start Trip'));

    await waitFor(() => {
      expect(getByText('Trip Started')).toBeTruthy();
    });
  });
});
```

### Error Testing

```typescript
import { mockAsyncStorageInstance, renderWithProviders } from '../helpers';

describe('Error Handling', () => {
  it('should handle storage failures', async () => {
    // Simulate storage failure
    mockAsyncStorageInstance.setFailureMode(true, new Error('Storage full'));

    const { getByText } = renderWithProviders(<MyComponent />);

    await waitFor(() => {
      expect(getByText('Error: Storage unavailable')).toBeTruthy();
    });
  });
});
```

## Best Practices

1. **Always use `setupKidMapTests()` in `beforeEach`** - Ensures consistent test environment
2. **Use appropriate render function** - Basic for components, full for integration
3. **Leverage mock data** - Don't create data inline, use provided mocks
4. **Test error scenarios** - Use failure simulation helpers
5. **Clean up between tests** - Helpers handle this automatically

## File Structure

```
__tests__/helpers/
├── index.ts                 # Central exports
├── mockAsyncStorage.ts      # AsyncStorage mock
├── mockTripData.ts          # Trip and user data
├── renderWithProviders.tsx  # Render utilities
├── safeZoneTestHelpers.ts   # Safe zone testing
├── testUtils.tsx            # General utilities
└── README.md               # This file
```

## Extending Helpers

When adding new helpers:

1. Create focused helper files for specific domains
2. Export from `index.ts` for easy importing
3. Include TypeScript types for better DX
4. Add examples to this README
5. Follow existing patterns for consistency

## Migration Guide

If you have existing tests with inline mocks:

### Before

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const { getByText } = render(<Component />);
```

### After

```typescript
import { setupKidMapTests, renderWithProviders } from '../helpers';

beforeEach(() => {
  setupKidMapTests();
});

const { getByText } = renderWithProviders(<Component />);
```

This migration provides:

- ✅ More realistic mock data
- ✅ Better error simulation
- ✅ Consistent test setup
- ✅ Proper provider wrapping
- ✅ Reusable test patterns
