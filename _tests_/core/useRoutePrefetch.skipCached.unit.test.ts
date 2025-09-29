import { prefetchRouteVariants } from '@/hooks/useRoutePrefetch';

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [{ id: 'r-sample' }]),
}));

jest.mock('@/telemetry', () => ({
  track: jest.fn(),
}));

jest.mock('@/utils/performance/performanceMarks', () => ({
  mark: jest.fn(),
}));

describe('prefetchRouteVariants - skip cached modes', () => {
  it('skips prefetch for modes already cached and does not prefetch the excluded mode', async () => {
    const origin = { id: 'o1' } as any;
    const destination = { id: 'd1' } as any;
    const baseOptions = { avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any;

    const prefetchCalls: any[] = [];

    const client = {
      getQueryState: (key: any) => {
        // Pretend 'walking' is already cached so it should be skipped
        if (Array.isArray(key) && key[3] === 'walking') return { data: [] };
        return undefined;
      },
      prefetchQuery: jest.fn(async ({ queryKey, queryFn }: any) => {
        prefetchCalls.push(queryKey);
        return queryFn();
      }),
    } as any;

    // exclude 'driving' from prefetching
    await prefetchRouteVariants(client, origin, destination, 'driving' as any, baseOptions);

    // Ensure we didn't prefetch the excluded mode
    expect(prefetchCalls.some((k) => k[3] === 'driving')).toBe(false);

    // Ensure we didn't prefetch the cached 'walking' mode
    expect(prefetchCalls.some((k) => k[3] === 'walking')).toBe(false);

    // We should have prefetched at least one other mode (e.g., 'transit' or 'biking')
    expect(prefetchCalls.length).toBeGreaterThan(0);
  });
});
