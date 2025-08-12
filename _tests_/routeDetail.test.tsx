import React from 'react';
import { render } from '@testing-library/react-native';
import RouteDetailScreen from '@/app/route/[id]';

// Mock expo-router useLocalSearchParams
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'r1' })
}));

// Mock navigation store
jest.mock('@/stores/navigationStore', () => {
  const actual = jest.requireActual('@/stores/navigationStore');
  return {
    useNavigationStore: () => ({
      origin: { id: 'o1', name: 'Origin', address: 'Addr', category: 'other', coordinates: { latitude: 0, longitude: 0 } },
      destination: { id: 'd1', name: 'Destination', address: 'Addr', category: 'other', coordinates: { latitude: 1, longitude: 1 } },
      availableRoutes: [
        { id: 'r1', totalDuration: 10, departureTime: '10:00', arrivalTime: '10:10', steps: [ { id: 's1', type: 'walk', from: 'Origin', to: 'Destination', duration: 10 } ] }
      ],
      selectedRoute: null,
    })
  };
});

// Mock location hook
jest.mock('@/hooks/useLocation', () => () => ({ location: { latitude:0, longitude:0, error:null }, hasLocation: true }));

// Mock child components with simple placeholders to avoid complexity
jest.mock('@/components/MapPlaceholder', () => ({ message }: any) => null);
jest.mock('@/components/VoiceNavigation', () => ({ currentStep }: any) => null);
jest.mock('@/modules/safety/components/SafetyPanel', () => () => null);
jest.mock('@/components/FeatureErrorBoundary', () => ({ children }: any) => children);
jest.mock('@/components/DirectionStep', () => ({ step }: any) => null);
jest.mock('@/components/FunFactCard', () => ({ onDismiss }: any) => null);

describe('RouteDetailScreen', () => {
  it('renders route content when data available', () => {
    const { queryByText } = render(<RouteDetailScreen />);
    expect(queryByText('Route not found')).toBeNull();
  });

  it('renders fallback when route missing', () => {
    (jest.requireMock('@/stores/navigationStore').useNavigationStore as any) = () => ({
      origin: null,
      destination: null,
      availableRoutes: [],
      selectedRoute: null,
    });
    const { getByText } = render(<RouteDetailScreen />);
    expect(getByText('Route not found')).toBeTruthy();
  });
});
