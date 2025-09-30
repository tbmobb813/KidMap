import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mutable metric counter to simulate cache hit/miss behavior
jest.mock('@/services/routeService', () => {
  let metricsCount = 0;
  const fetchRoutes = jest.fn(async () => {
    metricsCount += 1;
    return [{ id: 'route-1' }];
  });
  const getRouteServiceMetrics = jest.fn(() => ({ fetchCount: metricsCount }));
  const __setMetricsCount = (v: number) => {
    metricsCount = v;
  };
  return { fetchRoutes, getRouteServiceMetrics, __setMetricsCount };
});

jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock('@/telemetry', () => {
  const track = jest.fn();
  return { track };
});

jest.mock('@/utils/performance/performanceMarks', () => {
  const mark = jest.fn();
  const measure = jest.fn();
  return { mark, measure };
});

import { useRoutesQuery } from '@/hooks/useRoutesQuery';

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('useRoutesQuery (extra)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset mocked module counters
    const svc = require('@/services/routeService');
    if (svc && svc.__setMetricsCount) svc.__setMetricsCount(0);
  });

  it('does not call fetchRoutes when origin or destination is null (disabled query)', async () => {
    const Comp = ({ origin, destination }: any) => {
      useRoutesQuery(origin, destination, 'walking' as any, { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      return null;
    };

    renderWithClient(<Comp origin={null} destination={null} />);

    // wait briefly to ensure no async calls were made
    const svc = require('@/services/routeService');
    await waitFor(() => {
      expect(svc.fetchRoutes).not.toHaveBeenCalled();
    });
  });

  it('calls fetchRoutes and records cache miss when metrics change', async () => {
    const Comp = ({ origin, destination }: any) => {
      useRoutesQuery(origin, destination, 'walking' as any, { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      return null;
    };

    const origin = { id: 'o1' } as any;
    const destination = { id: 'd1' } as any;

    renderWithClient(<Comp origin={origin} destination={destination} />);

  const svc = require('@/services/routeService');
  const perf = require('@/utils/performance/performanceMarks');
  const telemetry = require('@/telemetry');
  await waitFor(() => expect(svc.fetchRoutes).toHaveBeenCalled());

  // Because fetchRoutes increments metricsCount, before != after -> cache miss
  expect(perf.mark).toHaveBeenCalled();
  // check that telemetry was recorded with a cacheHit boolean (false)
  expect(telemetry.track).toHaveBeenCalledWith(expect.objectContaining({ cacheHit: expect.any(Boolean), mode: 'walking' }));
  const lastTrack = telemetry.track.mock.calls[telemetry.track.mock.calls.length - 1][0];
  expect(lastTrack.cacheHit).toBe(false);
  });

  it('records cache hit when metrics unchanged', async () => {
  // Prepare metricsCount to be same before/after (simulate cache present)
  const svc = require('@/services/routeService');
  if (svc && svc.__setMetricsCount) svc.__setMetricsCount(1);
  // Override fetchRoutes to NOT change metricsCount for this test
  svc.fetchRoutes.mockImplementationOnce(async () => [{ id: 'route-2' }]);

    const Comp = ({ origin, destination }: any) => {
      useRoutesQuery(origin, destination, 'walking' as any, { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      return null;
    };

    const origin = { id: 'o2' } as any;
    const destination = { id: 'd2' } as any;

    renderWithClient(<Comp origin={origin} destination={destination} />);

  await waitFor(() => expect(svc.fetchRoutes).toHaveBeenCalled());

    // Because fetchRoutes didn't change metricsCount (we used mockImplementationOnce), before === after -> cache hit
    const perf = require('@/utils/performance/performanceMarks');
    const telemetry = require('@/telemetry');
    expect(perf.mark).toHaveBeenCalled();
    const lastTrack = telemetry.track.mock.calls[telemetry.track.mock.calls.length - 1][0];
    expect(lastTrack.cacheHit).toBe(true);
  });
});
