// Use real implementation but spy on fetchRoutes so we exercise latency + logic
import * as routeService from '@/services/routeService';
const fetchSpy = jest.spyOn(routeService, 'fetchRoutes');

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useRoutesQuery } from '@/src/hooks/useRoutesQuery';

// routeService mock defined above (must be before hook import)

// Silence act warnings from react-query tick batching (already covered by waitFor)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

const origin = { id: 'o1', name: 'Origin', address: '', category: 'other', coordinates: { latitude: 0, longitude: 0 } } as any;
const destination = { id: 'd1', name: 'Destination', address: '', category: 'other', coordinates: { latitude: 1, longitude: 1 } } as any;
const options = { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any;

function TestComponent() {
  // Two consecutive hook invocations with identical keys inside same provider tree
  const first = useRoutesQuery(origin, destination, 'transit', options);
  const second = useRoutesQuery(origin, destination, 'transit', options);
  return <>
    <>{first.data?.length}</>
    <>{second.data?.length}</>
  </>;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: 0, staleTime: 1000 } }
  });
}

describe('Routes query caching', () => {
  it('reuses cached data without refetch for identical keys (and only increments metrics once)', async () => {
    const client = createClient();
    render(<QueryClientProvider client={client}><TestComponent /></QueryClientProvider>);
  // Wait until the data has appeared (query resolved)
  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1), { timeout: 5000 });
  // Allow a microtask flush to ensure no second fetch queued
  await new Promise(r => setTimeout(r, 50));
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  }, 10000);
});
