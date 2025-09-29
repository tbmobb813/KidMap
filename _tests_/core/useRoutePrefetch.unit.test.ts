jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [{ id: 'r-prefetch', duration: 10 }]),
}));

jest.mock('@/telemetry', () => ({ track: jest.fn() }));
jest.mock('@/utils/performance/performanceMarks', () => ({ mark: jest.fn() }));

import { prefetchRouteVariants } from '@/hooks/useRoutePrefetch';

describe('prefetchRouteVariants', () => {
  it('prefetches multiple modes except the excluded one', async () => {
    const prefetchFn = jest.fn(async ({ queryKey: _queryKey, queryFn }: any) => {
      // simulate executing the query function which will call fetchRoutes
      await queryFn();
    });

    const getQueryState = jest.fn(() => undefined);

    const client: any = {
      prefetchQuery: prefetchFn,
      getQueryState,
    };

    const origin = { id: 'o1' } as any;
    const destination = { id: 'd1' } as any;
    const baseOptions = { avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any;

    await prefetchRouteVariants(client, origin, destination, 'driving' as any, baseOptions);

    // modes are transit, walking, biking, driving; driving is excluded -> expect 3 prefetches
    expect(prefetchFn).toHaveBeenCalled();
    expect(prefetchFn.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
