import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor, render } from '@testing-library/react-native';

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => { throw new Error('fetch failed'); }),
  getRouteServiceMetrics: jest.fn(() => ({ fetchCount: 0 })),
}));

jest.mock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));
jest.mock('@/telemetry/index', () => ({ track: jest.fn() }));
jest.mock('@/utils/performance/performanceMarks', () => ({ mark: jest.fn(), measure: jest.fn() }));

import { useRoutesQuery } from '@/hooks/useRoutesQuery';

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('useRoutesQuery error path', () => {
  it('tracks telemetry when fetch throws', async () => {
    const Comp = ({ origin, destination }: any) => {
      useRoutesQuery(origin, destination, 'walking' as any, { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      return null;
    };

    const origin = { id: 'o1' } as any;
    const destination = { id: 'd1' } as any;

  const { unmount } = renderWithClient(<Comp origin={origin} destination={destination} />);

    await waitFor(() => expect(require('@/services/routeService').fetchRoutes).toHaveBeenCalled());

  const telemetry = require('@/telemetry/index');
  // fetchRoutes throws, so the hook does not call the success tracking path
  expect(telemetry.track).not.toHaveBeenCalled();

    unmount();
  });
});
