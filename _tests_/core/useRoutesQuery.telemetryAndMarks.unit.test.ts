describe('useRoutesQuery - telemetry and marks are recorded', () => {
  it('calls fetchRoutes and track and records marks', async () => {
    jest.isolateModules(async () => {
      const mockedFetch = jest.fn(async () => [{ id: 'r-telemetry', duration: 99 }]);
      const mockedTrack = jest.fn();
      const marks: string[] = [];

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => ({ data: opts.queryFn ? opts.queryFn() : [] }),
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: mockedFetch,
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
      }));

      jest.doMock('@/telemetry/index', () => ({ track: mockedTrack }));

      jest.doMock('@/utils/performance/performanceMarks', () => ({
        mark: (s: string) => marks.push(s),
        measure: () => {},
      }));

      const mod = require('@/hooks/useRoutesQuery');

      const result = await mod.useRoutesQuery(
        { id: 'o1' },
        { id: 'd1' },
        'cycling',
        { travelMode: 'cycling', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
      );

      const data = result.data instanceof Promise ? await result.data : result.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].id).toBe('r-telemetry');
      expect(mockedFetch).toHaveBeenCalled();
      expect(mockedTrack).toHaveBeenCalled();
      // Expect marks to include start and end markers
      expect(marks.some((m) => m.startsWith('routes_fetch_start'))).toBe(true);
      expect(marks.some((m) => m.startsWith('routes_fetch_end'))).toBe(true);
    });
  });
});
