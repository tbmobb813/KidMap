import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import { render, mockRoute } from './testUtils';

import RouteCard from '@/components/RouteCard';
import { Route } from '@/types/navigation';


const route: Route = mockRoute;

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
    fireEvent.press(getByText('25 min'));
    expect(onPress).toHaveBeenCalledWith(route);
  });
});
