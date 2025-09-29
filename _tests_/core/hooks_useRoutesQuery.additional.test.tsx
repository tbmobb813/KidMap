import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

// We will mock the routeService module used by useRoutesQuery so the hook
// returns deterministic data without network calls.
jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [{ id: 'r1', duration: 100 }]),
  getRouteServiceMetrics: () => ({ fetchCount: 0 }),
}));

jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

import { useRoutesQuery } from '@/hooks/useRoutesQuery';
import { Place } from '@/types/navigation';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Harness({ origin, destination, mode, options }: any) {
  const q = useRoutesQuery(origin, destination, mode, options);
  return <Text testID="routes">{JSON.stringify({ data: q.data, isSuccess: q.isSuccess })}</Text>;
}

describe('useRoutesQuery (additional)', () => {
  it('returns empty array when origin or destination is missing (disabled)', async () => {
    const qc = createQueryClient();
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { getByTestId } = render(
      <Harness origin={null} destination={null} mode={'walking'} options={{ travelMode: 'walking' }} />,
      { wrapper }
    );

    await waitFor(() => {
      const node = getByTestId('routes');
      expect(node.props.children).toContain('[]');
    });
  });

  it('fetches routes when origin and destination provided', async () => {
    const qc = createQueryClient();
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const origin: Place = { id: 'o1', name: 'Origin', lat: 0, lng: 0 } as any;
    const destination: Place = { id: 'd1', name: 'Dest', lat: 1, lng: 1 } as any;

    const { getByTestId } = render(
      <Harness origin={origin} destination={destination} mode={'driving'} options={{ travelMode: 'driving' }} />,
      { wrapper }
    );

    await waitFor(() => {
      const node = getByTestId('routes');
      expect(node.props.children).toContain('r1');
    });
  });
});

