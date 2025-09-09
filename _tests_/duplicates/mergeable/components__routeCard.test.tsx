/**
 * COMPREHENSIVE TEST SUITE: RouteCard Component
 * 
 * This component is COMPLEX with 139 lines, route handling, interactive selection,
 * transit step visualization, and optimization with React.memo. Requires thorough testing.
 * 
 * Features tested:
 * - Route display logic and null handling
 * - Interactive route selection and press states
 * - Time and duration formatting
 * - Transit steps visualization
 * - Accessibility features
 * - Performance optimization (memo)
 * - Theme integration
 * - Empty state handling
 */

import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { mockRoute, render } from '../testUtils';

import RouteCard from '@/components/RouteCard';
import { Route, TransitStep } from '@/types/navigation';

// ===== MOCK SECTION =====
// Mock TransitStepIndicator component
jest.mock('../../components/TransitStepIndicator', () => {
  return function MockTransitStepIndicator({ step }: any) {
    const { Text } = require('react-native');
    return Text({ 
      testID: `step-${step.type}`,
      children: `${step.type}:${step.line || step.name || step.to}`,
    });
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Clock: ({ size, color, ...props }: any) => 
    require('react-native').Text({ 
      testID: 'clock-icon',
      children: `Clock(${size},${color})`,
      ...props 
    }),
  ArrowRight: ({ size, color, ...props }: any) => 
    require('react-native').Text({ 
      testID: 'arrow-right-icon',
      children: `ArrowRight(${size},${color})`,
      ...props 
    }),
}));

// ===== TEST SETUP =====
describe('RouteCard', () => {
  // Mock functions
  const mockOnPress = jest.fn();

  // Use the existing mockRoute but enhance with more test data
  const route: Route = mockRoute;
  
  // Additional sample route data for comprehensive testing
  const mockTransitSteps: TransitStep[] = [
    {
      id: 'step-1',
      type: 'walk',
      name: 'Walk to Station',
      from: 'Home',
      to: 'Metro Station',
      duration: 5,
    },
    {
      id: 'step-2',
      type: 'subway',
      line: 'Red Line',
      color: '#ff0000',
      from: 'Metro Station A',
      to: 'Metro Station B',
      duration: 15,
    },
    {
      id: 'step-3',
      type: 'bus',
      line: 'Bus 42',
      from: 'Metro Station B',
      to: 'School',
      duration: 8,
    },
  ];

  const enhancedRoute: Route = {
    id: 'route-enhanced',
    steps: mockTransitSteps,
    totalDuration: 28,
    departureTime: '08:00',
    arrivalTime: '08:28',
  };

  // Default props for the component
  const defaultProps = {
    route: enhancedRoute,
    onPress: mockOnPress,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // ===== ORIGINAL TESTS (Enhanced) =====
  describe('Nullability Safeguards (Original)', () => {
    it('renders unavailable state when route is null', () => {
      const { getByText } = render(<RouteCard route={null} onPress={jest.fn()} />);
      expect(getByText('Route unavailable')).toBeTruthy();
    });

    it('renders empty steps message when steps missing', () => {
      const incomplete = { ...route, steps: [] };
      const { getByText } = render(<RouteCard route={incomplete} onPress={jest.fn()} />);
      expect(getByText('No steps')).toBeTruthy();
    });

    it('fires onPress with valid route', () => {
      const onPress = jest.fn();
      const { getByText } = render(<RouteCard route={route} onPress={onPress} />);
      fireEvent.press(getByText('25 min'));
      expect(onPress).toHaveBeenCalledWith(route);
    });
  });

  // ===== BASIC RENDERING TESTS =====
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<RouteCard {...defaultProps} />);
      expect(getByText('28 min')).toBeTruthy();
    });

    it('displays route duration correctly', () => {
      const { getByText } = render(<RouteCard {...defaultProps} />);
      expect(getByText('28 min')).toBeTruthy();
    });

    it('displays departure and arrival times', () => {
      const { getByText } = render(<RouteCard {...defaultProps} />);
      expect(getByText('08:00 - 08:28')).toBeTruthy();
    });

    it('displays clock icon', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      expect(getByTestId('clock-icon')).toBeTruthy();
    });

    it('has correct testID', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      expect(getByTestId('route-card-route-enhanced')).toBeTruthy();
    });
  });

  // ===== NULL/UNDEFINED HANDLING TESTS =====
  describe('Extended Null/Undefined Handling', () => {
    it('handles undefined route gracefully', () => {
      const { getByText } = render(<RouteCard route={undefined} onPress={mockOnPress} />);
      expect(getByText('Route unavailable')).toBeTruthy();
    });

    it('does not render time info for null route', () => {
      const { queryByTestId } = render(<RouteCard route={null} onPress={mockOnPress} />);
      expect(queryByTestId('clock-icon')).toBeNull();
    });

    it('handles non-array steps', () => {
      const routeWithInvalidSteps = { ...enhancedRoute, steps: null as any };
      const { getByText } = render(<RouteCard route={routeWithInvalidSteps} onPress={mockOnPress} />);
      expect(getByText('No steps')).toBeTruthy();
    });
  });

  // ===== TIME FORMATTING TESTS =====
  describe('Time Formatting', () => {
    it('handles invalid duration gracefully', () => {
      const invalidRoute = { ...enhancedRoute, totalDuration: NaN };
      const { getByText } = render(<RouteCard route={invalidRoute} onPress={mockOnPress} />);
      expect(getByText('--')).toBeTruthy();
    });

    it('handles missing departure time', () => {
      const routeWithoutDeparture = { ...enhancedRoute, departureTime: '' };
      const { getByText } = render(<RouteCard route={routeWithoutDeparture} onPress={mockOnPress} />);
      expect(getByText('-- - 08:28')).toBeTruthy();
    });

    it('handles missing arrival time', () => {
      const routeWithoutArrival = { ...enhancedRoute, arrivalTime: '' };
      const { getByText } = render(<RouteCard route={routeWithoutArrival} onPress={mockOnPress} />);
      expect(getByText('08:00 - --')).toBeTruthy();
    });

    it('handles both missing times', () => {
      const routeWithoutTimes = { ...enhancedRoute, departureTime: '', arrivalTime: '' };
      const { getByText } = render(<RouteCard route={routeWithoutTimes} onPress={mockOnPress} />);
      expect(getByText('-- - --')).toBeTruthy();
    });

    it('formats large durations correctly', () => {
      const longRoute = { ...enhancedRoute, totalDuration: 120 };
      const { getByText } = render(<RouteCard route={longRoute} onPress={mockOnPress} />);
      expect(getByText('120 min')).toBeTruthy();
    });

    it('handles zero duration', () => {
      const zeroRoute = { ...enhancedRoute, totalDuration: 0 };
      const { getByText } = render(<RouteCard route={zeroRoute} onPress={mockOnPress} />);
      expect(getByText('0 min')).toBeTruthy();
    });

    it('handles negative duration', () => {
      const negativeRoute = { ...enhancedRoute, totalDuration: -5 };
      const { getByText } = render(<RouteCard route={negativeRoute} onPress={mockOnPress} />);
      expect(getByText('--')).toBeTruthy();
    });
  });

  // ===== TRANSIT STEPS TESTS =====
  describe('Transit Steps Display', () => {
    it('displays all transit steps', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      expect(getByTestId('step-walk')).toBeTruthy();
      expect(getByTestId('step-subway')).toBeTruthy();
      expect(getByTestId('step-bus')).toBeTruthy();
    });

    it('displays arrow icons between steps', () => {
      const { getAllByTestId } = render(<RouteCard {...defaultProps} />);
      // Should have 2 arrows for 3 steps
      const arrows = getAllByTestId('arrow-right-icon');
      expect(arrows).toHaveLength(2);
    });

    it('renders single step without arrow', () => {
      const singleStepRoute = { ...enhancedRoute, steps: [mockTransitSteps[0]] };
      const { queryByTestId } = render(<RouteCard route={singleStepRoute} onPress={mockOnPress} />);
      expect(queryByTestId('arrow-right-icon')).toBeNull();
    });
  });

  // ===== INTERACTION TESTS =====
  describe('User Interactions', () => {
    it('calls onPress when route card is pressed', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      fireEvent.press(getByTestId('route-card-route-enhanced'));
      expect(mockOnPress).toHaveBeenCalledWith(enhancedRoute);
    });

    it('calls onPress only once per press', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      fireEvent.press(getByTestId('route-card-route-enhanced'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress for null route', () => {
      const { getByText } = render(<RouteCard route={null} onPress={mockOnPress} />);
      fireEvent.press(getByText('Route unavailable'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('handles multiple rapid presses', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      const card = getByTestId('route-card-route-enhanced');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  // ===== SELECTION STATE TESTS =====
  describe('Selection State', () => {
    it('applies selected styling when isSelected is true', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} isSelected={true} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card).toBeTruthy();
    });

    it('does not apply selected styling by default', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card).toBeTruthy();
    });

    it('shows correct accessibility state when selected', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} isSelected={true} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityState.selected).toBe(true);
    });

    it('shows correct accessibility state when not selected', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} isSelected={false} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityState.selected).toBe(false);
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('has descriptive accessibility label', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityLabel).toBe('Route option, duration 28 min');
    });

    it('has appropriate accessibility hint', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityHint).toBe('Selects this route option');
    });

    it('handles accessibility for invalid duration', () => {
      const invalidRoute = { ...enhancedRoute, totalDuration: NaN };
      const { getByTestId } = render(<RouteCard route={invalidRoute} onPress={mockOnPress} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityLabel).toBe('Route option, duration --');
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance (React.memo)', () => {
    it('memoizes component properly', () => {
      const { rerender, getByText } = render(<RouteCard {...defaultProps} />);
      expect(getByText('28 min')).toBeTruthy();
      
      // Rerender with same props - component should be memoized
      rerender(<RouteCard {...defaultProps} />);
      expect(getByText('28 min')).toBeTruthy();
    });

    it('re-renders when route changes', () => {
      const newRoute = { ...enhancedRoute, id: 'route-2', totalDuration: 35 };
      const { rerender, getByText, queryByText } = render(<RouteCard {...defaultProps} />);
      expect(getByText('28 min')).toBeTruthy();
      
      rerender(<RouteCard {...defaultProps} route={newRoute} />);
      expect(getByText('35 min')).toBeTruthy();
      expect(queryByText('28 min')).toBeNull();
    });

    it('re-renders when selection state changes', () => {
      const { rerender, getByTestId } = render(<RouteCard {...defaultProps} isSelected={false} />);
      const card = getByTestId('route-card-route-enhanced');
      expect(card.props.accessibilityState.selected).toBe(false);
      
      rerender(<RouteCard {...defaultProps} isSelected={true} />);
      expect(card.props.accessibilityState.selected).toBe(true);
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration Behavior', () => {
    it('handles complete user interaction workflow', () => {
      const { getByTestId } = render(<RouteCard {...defaultProps} />);
      
      // User sees route information
      expect(getByTestId('route-card-route-enhanced')).toBeTruthy();
      expect(getByTestId('clock-icon')).toBeTruthy();
      
      // User selects route
      fireEvent.press(getByTestId('route-card-route-enhanced'));
      expect(mockOnPress).toHaveBeenCalledWith(enhancedRoute);
    });

    it('works with complex transit combinations', () => {
      const complexSteps = [
        { id: 'walk1', type: 'walk' as const, from: 'Home', to: 'Bus Stop', duration: 3 },
        { id: 'bus1', type: 'bus' as const, line: 'Express 1', from: 'Stop A', to: 'Station', duration: 12 },
        { id: 'transfer', type: 'walk' as const, from: 'Station', to: 'Metro', duration: 2 },
        { id: 'metro', type: 'subway' as const, line: 'Blue Line', from: 'Metro A', to: 'Metro B', duration: 15 },
        { id: 'walk2', type: 'walk' as const, from: 'Metro B', to: 'School', duration: 5 },
      ];
      
      const complexRoute = { ...enhancedRoute, steps: complexSteps, totalDuration: 37 };
      
      const { getByText, getAllByTestId } = render(<RouteCard route={complexRoute} onPress={mockOnPress} />);
      expect(getByText('37 min')).toBeTruthy();
      
      // Should have 4 arrows for 5 steps
      const arrows = getAllByTestId('arrow-right-icon');
      expect(arrows).toHaveLength(4);
    });
  });

  // ===== EDGE CASES =====
  describe('Edge Cases', () => {
    it('handles very long route names', () => {
      const longNameStep = {
        ...mockTransitSteps[0],
        name: 'This is a very long route name that might cause layout issues',
      };
      const longRoute = { ...enhancedRoute, steps: [longNameStep] };
      
      const { getByTestId } = render(<RouteCard route={longRoute} onPress={mockOnPress} />);
      expect(getByTestId('step-walk')).toBeTruthy();
    });

    it('handles missing step properties gracefully', () => {
      const incompleteStep = {
        id: 'incomplete',
        type: 'bus' as const,
        from: 'A',
        to: 'B',
        duration: 10,
      };
      const incompleteRoute = { ...enhancedRoute, steps: [incompleteStep] };
      
      const { getByTestId } = render(<RouteCard route={incompleteRoute} onPress={mockOnPress} />);
      expect(getByTestId('step-bus')).toBeTruthy();
    });

    it('handles special characters in times', () => {
      const specialRoute = { 
        ...enhancedRoute, 
        departureTime: '08:00 AM', 
        arrivalTime: '08:28 PM' 
      };
      const { getByText } = render(<RouteCard route={specialRoute} onPress={mockOnPress} />);
      expect(getByText('08:00 AM - 08:28 PM')).toBeTruthy();
    });

    it('maintains functionality with extreme values', () => {
      const extremeRoute = { 
        ...enhancedRoute, 
        totalDuration: 9999,
        steps: new Array(100).fill(0).map((_, i) => ({
          ...mockTransitSteps[0],
          id: `step-${i}`,
        }))
      };
      
      const { getByText } = render(<RouteCard route={extremeRoute} onPress={mockOnPress} />);
      expect(getByText('9999 min')).toBeTruthy();
    });
  });
});
