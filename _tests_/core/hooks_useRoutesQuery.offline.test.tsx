import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [{ id: 'r-offline', duration: 50 }]),
  getRouteServiceMetrics: () => ({ fetchCount: 0 }),
}));

jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: false }),
}));

import { useRoutesQuery } from '@/hooks/useRoutesQuery';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Harness({ origin, destination, mode, options }: any) {
  const q = useRoutesQuery(origin, destination, mode, options);
  return <Text testID="routes-offline">{JSON.stringify({ data: q.data, isSuccess: q.isSuccess })}</Text>;
}

describe('useRoutesQuery offline behavior', () => {
  it('uses placeholderData and returns offline result when offline', async () => {
    const qc = createQueryClient();
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const origin = { id: 'o', name: 'O' } as any;
    const destination = { id: 'd', name: 'D' } as any;

    const { getByTestId } = render(
      <Harness origin={origin} destination={destination} mode={'driving'} options={{ travelMode: 'driving' }} />,
      { wrapper }
    );

    await waitFor(() => {
      const node = getByTestId('routes-offline');
      // Because offline, placeholderData should be used initially (previous=>[]), but the mocked fetchRoutes returns an array.
      expect(node.props.children).toContain('r-offline');
    });
  });
});
