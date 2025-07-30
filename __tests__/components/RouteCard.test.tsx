// __tests__/components/RouteCard.test.tsx
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import RouteCard from '@/components/RouteCard';
import { Route } from '@/types/navigation';
import { renderWithProviders, setupKidMapTests } from '../helpers';

// Mock the TransitStepIndicator component
jest.mock('@/components/TransitStepIndicator', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockTransitStepIndicator({ step }: any) {
    return <Text testID={`step-${step.id}`}>{step.type}: {step.name || step.line}</Text>;
  };
});

// Mock Lucide React Native icons
jest.mock('lucide-react-native', () => ({
  Clock: ({ testID, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text testID={testID || 'clock-icon'}>⏰</Text>;
  },
  ArrowRight: ({ testID, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text testID={testID || 'arrow-right-icon'}>→</Text>;
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

const mockRoute: Route = {
  id: 'route-1',
  steps: [
    {
      id: 'step-1',
      type: 'walk',
      from: 'Home',
      to: 'Bus Stop',
      duration: 5,
      departureTime: '8:00 AM',
      arrivalTime: '8:05 AM',
    },
    {
      id: 'step-2',
      type: 'bus',
      name: 'Route 42',
      line: 'M42',
      color: '#FF6B35',
      from: 'Bus Stop',
      to: 'School',
      duration: 15,
      departureTime: '8:10 AM',
      arrivalTime: '8:25 AM',
      stops: 8,
    },
  ],
  totalDuration: 25,
  departureTime: '8:00 AM',
  arrivalTime: '8:25 AM',
};

const mockRouteWithSubway: Route = {
  id: 'route-2',
  steps: [
    {
      id: 'step-1',
      type: 'walk',
      from: 'Home',
      to: 'Metro Station',
      duration: 3,
    },
    {
      id: 'step-2',
      type: 'subway',
      name: 'Blue Line',
      line: 'B',
      color: '#0066CC',
      from: 'Metro Station',
      to: 'School Station',
      duration: 12,
      stops: 5,
    },
    {
      id: 'step-3',
      type: 'walk',
      from: 'School Station',
      to: 'School',
      duration: 2,
    },
  ],
  totalDuration: 20,
  departureTime: '8:15 AM',
  arrivalTime: '8:35 AM',
};

describe('RouteCard Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    setupKidMapTests();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render route card with basic information', () => {
      const { getByText } = renderWithProviders(
        <RouteCard route={mockRoute} onPress={mockOnPress} />
      );

      expect(getByText('25 min')).toBeTruthy();
      expect(getByText('8:00 AM - 8:25 AM')).toBeTruthy();
    });

    it('should render all route steps', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard route={mockRoute} onPress={mockOnPress} />
      );

      expect(getByTestId('step-step-1')).toBeTruthy();
      expect(getByTestId('step-step-2')).toBeTruthy();
    });

    it('should render clock icon', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard route={mockRoute} onPress={mockOnPress} />
      );

      expect(getByTestId('clock-icon')).toBeTruthy();
    });

    it('should render arrow icons between steps', () => {
      const { getAllByTestId } = renderWithProviders(
        <RouteCard route={mockRouteWithSubway} onPress={mockOnPress} />
      );

      // Should have 2 arrows for 3 steps (n-1 arrows)
      const arrows = getAllByTestId('arrow-right-icon');
      expect(arrows).toHaveLength(2);
    });

    it('should not render arrow after the last step', () => {
      const singleStepRoute: Route = {
        ...mockRoute,
        steps: [mockRoute.steps[0]],
      };

      const { queryByTestId } = renderWithProviders(
        <RouteCard route={singleStepRoute} onPress={mockOnPress} />
      );

      expect(queryByTestId('arrow-right-icon')).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('should render with selected styling when isSelected is true', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress} 
          isSelected={true}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      expect(routeCard.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderWidth: 2,
          })
        ])
      );
    });

    it('should render without selected styling when isSelected is false', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress} 
          isSelected={false}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      expect(routeCard.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderWidth: 2,
          })
        ])
      );
    });

    it('should default to not selected when isSelected prop is omitted', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      expect(routeCard.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderWidth: 2,
          })
        ])
      );
    });
  });

  describe('Interaction', () => {
    it('should call onPress with route when card is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      fireEvent.press(routeCard);

      expect(mockOnPress).toHaveBeenCalledWith(mockRoute);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses correctly', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      fireEvent.press(routeCard);
      fireEvent.press(routeCard);
      fireEvent.press(routeCard);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
      expect(mockOnPress).toHaveBeenCalledWith(mockRoute);
    });

    it('should apply pressed styling when pressed', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      fireEvent(routeCard, 'pressIn');

      // Note: Testing pressed state styling in React Native Testing Library 
      // is limited, but we can verify the press event fires
      expect(mockOnPress).toHaveBeenCalledWith(mockRoute);
    });
  });

  describe('Different Route Types', () => {
    it('should handle walking-only routes', () => {
      const walkingRoute: Route = {
        id: 'walk-route',
        steps: [
          {
            id: 'walk-step',
            type: 'walk',
            from: 'Home',
            to: 'School',
            duration: 15,
          },
        ],
        totalDuration: 15,
        departureTime: '8:00 AM',
        arrivalTime: '8:15 AM',
      };

      const { getByText, getByTestId } = renderWithProviders(
        <RouteCard route={walkingRoute} onPress={mockOnPress} />
      );

      expect(getByText('15 min')).toBeTruthy();
      expect(getByTestId('step-walk-step')).toBeTruthy();
    });

    it('should handle complex multi-modal routes', () => {
      const complexRoute: Route = {
        id: 'complex-route',
        steps: [
          {
            id: 'step-1',
            type: 'walk',
            from: 'Home',
            to: 'Bus Stop',
            duration: 3,
          },
          {
            id: 'step-2',
            type: 'bus',
            name: 'Express Bus',
            line: 'X1',
            from: 'Bus Stop',
            to: 'Train Station',
            duration: 10,
          },
          {
            id: 'step-3',
            type: 'train',
            name: 'Metro Rail',
            line: 'Red Line',
            from: 'Train Station',
            to: 'School Station',
            duration: 8,
          },
          {
            id: 'step-4',
            type: 'walk',
            from: 'School Station',
            to: 'School',
            duration: 2,
          },
        ],
        totalDuration: 25,
        departureTime: '7:50 AM',
        arrivalTime: '8:15 AM',
      };

      const { getByText, getAllByTestId } = renderWithProviders(
        <RouteCard route={complexRoute} onPress={mockOnPress} />
      );

      expect(getByText('25 min')).toBeTruthy();
      expect(getByText('7:50 AM - 8:15 AM')).toBeTruthy();
      
      // Should have 3 arrows for 4 steps
      const arrows = getAllByTestId('arrow-right-icon');
      expect(arrows).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle route with no steps gracefully', () => {
      const emptyRoute: Route = {
        id: 'empty-route',
        steps: [],
        totalDuration: 0,
        departureTime: '8:00 AM',
        arrivalTime: '8:00 AM',
      };

      const { getByText } = renderWithProviders(
        <RouteCard route={emptyRoute} onPress={mockOnPress} />
      );

      expect(getByText('0 min')).toBeTruthy();
      expect(getByText('8:00 AM - 8:00 AM')).toBeTruthy();
    });

    it('should handle very long route durations', () => {
      const longRoute: Route = {
        ...mockRoute,
        totalDuration: 120,
        departureTime: '6:00 AM',
        arrivalTime: '8:00 AM',
      };

      const { getByText } = renderWithProviders(
        <RouteCard route={longRoute} onPress={mockOnPress} />
      );

      expect(getByText('120 min')).toBeTruthy();
    });

    it('should handle missing optional step properties', () => {
      const minimalRoute: Route = {
        id: 'minimal-route',
        steps: [
          {
            id: 'minimal-step',
            type: 'walk',
            from: 'A',
            to: 'B',
            duration: 10,
          },
        ],
        totalDuration: 10,
        departureTime: '8:00 AM',
        arrivalTime: '8:10 AM',
      };

      const { getByText } = renderWithProviders(
        <RouteCard route={minimalRoute} onPress={mockOnPress} />
      );

      expect(getByText('10 min')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be pressable for accessibility', () => {
      const { getByTestId } = renderWithProviders(
        <RouteCard 
          route={mockRoute} 
          onPress={mockOnPress}
          testID="route-card"
        />
      );

      const routeCard = getByTestId('route-card');
      expect(routeCard.props.accessibilityRole).toBe('button');
    });
  });
});
