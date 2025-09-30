import React from 'react';
import { Text } from 'react-native';

import { render } from '../testUtils';

import { useRoutesQuery } from '@/hooks/useRoutesQuery';

// Mock services/routeService fetchRoutes
jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(() => Promise.resolve([])),
  getRouteServiceMetrics: () => ({ fetchCount: 0 }),
}));

function Harness({ origin, destination }: any) {
  // Use a simple string travel mode that aligns with existing tests
  const result = useRoutesQuery(origin, destination, 'walking' as any, { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false });
  return <Text>{JSON.stringify(result.data || [])}</Text>;
}

describe('useRoutesQuery harness', () => {
  it('returns empty array when no routes available', async () => {
    const rendered = render(<Harness origin={{ id: 'a' }} destination={{ id: 'b' }} />);
    await rendered.findByText('[]');
  });
});
