import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RouteCard from '@/components/RouteCard';
import { Route } from '@/types/navigation';

const route: Route = {
  id: 'r1',
  totalDuration: 12,
  departureTime: '09:00',
  arrivalTime: '09:12',
  steps: [
    { id: 's1', type: 'walk', from: 'A', to: 'B', duration: 5 },
    { id: 's2', type: 'bus', from: 'B', to: 'C', duration: 7 }
  ]
};

describe('RouteCard nullability safeguards', () => {
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
    fireEvent.press(getByText('12 min'));
    expect(onPress).toHaveBeenCalledWith(route);
  });
});
