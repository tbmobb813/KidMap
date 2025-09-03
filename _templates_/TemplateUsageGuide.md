# Test Template Comparison & Usage Guide

This guide helps you choose between the comprehensive and basic test templates and provides usage examples for both.

## Template Comparison

### Comprehensive Template (ComponentTestTemplate.test.tsx)

**USE WHEN:**

* Component is critical to user safety or core functionality
* Component handles complex business logic
* Component has many interaction patterns
* Component requires thorough validation before production
* Component will be used extensively across the app

**COVERAGE INCLUDES:**

* Basic rendering (3+ tests)
* All interaction types (4+ tests)
* Conditional rendering (3+ tests)
* Props variations (4+ tests)
* Loading/error states (2+ tests)
* Accessibility (2+ tests)
* Theme support (3+ tests)
* Integration workflows (2+ tests)
* Edge cases (3+ tests)

**TOTAL:** ~26+ tests per component  
**TIME INVESTMENT:** Medium-High

### Basic Template (BasicTestTemplate.test.tsx)

**USE WHEN:**

* Component is straightforward with minimal logic
* Component is used in limited contexts
* Time constraints require quick validation
* Component is a simple UI element or wrapper
* Component has minimal user interaction

**COVERAGE INCLUDES:**

* Crash prevention (1 test)
* Critical elements display (1 test)
* Primary interaction (1 test)
* Prop variations (1 test)
* Conditional rendering (1 test)
* Basic accessibility (1 test)
* Error handling (1 test)

**TOTAL:** 7 essential tests per component  
**TIME INVESTMENT:** Low

## Usage Examples

### Example 1: Using Basic Template for SimpleButton

```typescript
// SimpleButton.test.tsx - Based on BasicTestTemplate
import { jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import SimpleButton from '../../components/SimpleButton';
import { createTestWrapper } from '../testUtils';

// Mock only essential dependencies
jest.mock('@/hooks/useToast', () => ({ useToast: jest.fn() }));

describe('SimpleButton - Basic Tests', () => {
  const mockOnPress = jest.fn();
  const defaultProps = { title: 'Click Me', onPress: mockOnPress };

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = render(
      <SimpleButton {...defaultProps} />, 
      { wrapper: createTestWrapper() }
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  // ... 6 more essential tests
});
```

### Example 2: Using Comprehensive Template for ComplexComponent

```typescript
// NavigationCard.test.tsx - Based on ComponentTestTemplate  
import { jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import NavigationCard from '../../components/NavigationCard';
import { createTestWrapper } from '../testUtils';

describe('NavigationCard', () => {
  // Extensive mock setup with all scenarios...
  // 26+ comprehensive tests covering all patterns...
});
```

## Decision Matrix

| Component Type | Template Choice | Reasoning |
|---|---|---|
| Safety-critical (emergency) | Comprehensive | User safety depends on reliability |
| Core navigation | Comprehensive | App functionality depends on it |
| Payment/transaction | Comprehensive | Financial impact of bugs |
| Complex forms | Comprehensive | Many interaction patterns |
| Data visualization | Comprehensive | Complex logic and edge cases |
| Simple UI components | Basic | Minimal logic, low risk |
| Wrapper components | Basic | Pass-through functionality |
| Static content displays | Basic | No complex interactions |
| Utility components | Basic | Limited scope of use |
| Prototype/experimental features | Basic | Quick validation needed |

## Template Customization Tips

### Basic Template Customization

1. Keep the 7 core test patterns
2. Add 1-2 component-specific tests if needed
3. Focus on the most likely failure scenarios
4. Don't over-engineer - stay minimal

### Comprehensive Template Customization

1. Use all 13 test categories as starting points
2. Add component-specific edge cases
3. Include integration scenarios with other components
4. Test all user paths and error conditions
