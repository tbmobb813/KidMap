import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRoutesQuery } from '@/src/hooks/useRoutesQuery';

// Mock routeService to track calls
jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [
    { id: 'r1', totalDuration: 10, departureTime: '10:00', arrivalTime: '10:10', steps: [ { id: 's1', type: 'walk', from: 'A', to: 'B', duration: 10 } ] }
  ])
}));

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

const { fetchRoutes } = require('@/services/routeService');

describe('Routes query caching', () => {
  it('reuses cached data without refetch for identical keys', async () => {
    const client = createClient();
    render(<QueryClientProvider client={client}><TestComponent /></QueryClientProvider>);
    await waitFor(() => expect(fetchRoutes).toHaveBeenCalledTimes(1), { timeout: 3000 });
  }, 10000);
});
