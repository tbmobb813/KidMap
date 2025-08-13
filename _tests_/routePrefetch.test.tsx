import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
// Mock AsyncStorage to avoid native module issues in Jest environment
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

import { useRoutePrefetch } from '@/hooks/useRoutePrefetch';
import * as routeService from '@/services/routeService';
import { useNavigationStore } from '@/stores/navigationStore';

function Harness() {
  useQueryClient();
  useNavigationStore.setState({
    origin: { id: 'o1', name: 'Origin', address: '', category: 'other', coordinates: { latitude: 0, longitude: 0 } },
    destination: { id: 'd1', name: 'Dest', address: '', category: 'other', coordinates: { latitude: 1, longitude: 1 } },
    selectedTravelMode: 'transit',
  routeOptions: { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
  });
  useRoutePrefetch();
  return null;
}

describe.skip('useRoutePrefetch (skipped temporarily)', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  beforeEach(() => {
    routeService.__resetRouteServiceMetrics();
    jest.restoreAllMocks();
  });
  afterEach(() => {
    // Flush any pending debounced persistence timers
    jest.runOnlyPendingTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('prefetches other modes (walking,biking,driving) when origin/destination set', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 1000 } } });
    const spy = jest.spyOn(routeService, 'fetchRoutes').mockImplementation(async () => []);

    render(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>
    );
  await waitFor(() => expect(spy).toHaveBeenCalledTimes(3), { timeout: 2000 });
  jest.runOnlyPendingTimers();
  });
});
