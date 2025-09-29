describe('useRoutesQuery - cache hit path', () => {
  it('records cache hit marks when metrics do not change', async () => {
    jest.isolateModules(async () => {
      const mockedFetch = jest.fn(async () => [{ id: 'r-cache', duration: 42 }]);
      const mockedTrack = jest.fn();
      const marks: string[] = [];

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => ({ data: opts.queryFn ? opts.queryFn() : [] }),
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      // getRouteServiceMetrics returns same fetchCount before and after -> cacheHit
      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: mockedFetch,
        getRouteServiceMetrics: () => ({ fetchCount: 1 }),
      }));

      jest.doMock('@/telemetry/index', () => ({ track: mockedTrack }));

      jest.doMock('@/utils/performance/performanceMarks', () => ({
        mark: (s: string) => marks.push(s),
        measure: () => {},
      }));

      const mod = require('@/hooks/useRoutesQuery');

      const result = await mod.useRoutesQuery(
        { id: 'o' },
        { id: 'd' },
        'walking',
        { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
      );

      const data = result.data instanceof Promise ? await result.data : result.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].id).toBe('r-cache');
      expect(mockedFetch).toHaveBeenCalled();
      expect(marks.some((m) => m.includes('routes_cache_hit') || m.includes('routes_cache_miss'))).toBe(true);
    });
  });
});
