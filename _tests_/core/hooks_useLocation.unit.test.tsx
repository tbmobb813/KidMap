// Mocks must be declared before importing the hook under test
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 1,
  },
}));

import React from 'react';
import { Text } from 'react-native';

import { render, waitFor } from '../testUtils';

import useLocation from '@/hooks/useLocation';

function Harness() {
  const { location, loading, hasLocation } = useLocation();
  return (
    <Text testID="loc">{JSON.stringify({ location, loading, hasLocation })}</Text>
  );
}

describe('useLocation hook', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns coordinates when permission granted', async () => {
    const expoLocation = require('expo-location');
    // Permission granted
    (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (expoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 1.23, longitude: 4.56 } });

    const rendered = render(<Harness />);

    await waitFor(() => {
      const node = rendered.getByTestId('loc');
      const text = node.props.children as string;
      expect(text).toContain('1.23');
      expect(text).toContain('4.56');
      expect(text).toContain('"hasLocation":true');
    });
  });

  it('sets error when permission denied', async () => {
    const expoLocation = require('expo-location');
    (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const rendered = render(<Harness />);

    await waitFor(() => {
      const node = rendered.getByTestId('loc');
      const text = node.props.children as string;
      expect(text).toContain('Permission to access location was denied');
      expect(text).toContain('"hasLocation":false');
    });
  });
});
