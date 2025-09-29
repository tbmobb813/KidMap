describe('useRoutesQuery - enabled and cache track behaviors', () => {
  it('returns empty array when origin or destination is null (enabled false)', async () => {
    jest.isolateModules(async () => {
      const mockedFetch = jest.fn(async () => [{ id: 'r1' }]);

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

      jest.doMock('@/telemetry/index', () => ({ track: jest.fn() }));

      const mod = require('@/hooks/useRoutesQuery');

      // Missing origin -> enabled should be false and queryFn should return []
      const result1 = await mod.useRoutesQuery(null, { id: 'd' }, 'walking', { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false });
      const data1 = result1.data instanceof Promise ? await result1.data : result1.data;
      expect(Array.isArray(data1)).toBe(true);
      expect(data1.length).toBe(0);

      // Missing destination -> enabled false
      const result2 = await mod.useRoutesQuery({ id: 'o' }, null, 'walking', { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false });
      const data2 = result2.data instanceof Promise ? await result2.data : result2.data;
      expect(Array.isArray(data2)).toBe(true);
      expect(data2.length).toBe(0);

      // Ensure fetchRoutes was never called
      expect(mockedFetch).not.toHaveBeenCalled();
    });
  });

  it('calls track with cacheHit true when metrics unchanged', async () => {
    jest.isolateModules(async () => {
      const mockedFetch = jest.fn(async () => [{ id: 'r-cache-2' }]);
      const mockedTrack = jest.fn();

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => ({ data: opts.queryFn ? opts.queryFn() : [] }),
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      // getRouteServiceMetrics returns same fetchCount before and after -> cacheHit
      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: mockedFetch,
        getRouteServiceMetrics: () => ({ fetchCount: 5 }),
      }));

      jest.doMock('@/telemetry/index', () => ({ track: mockedTrack }));

      const mod = require('@/hooks/useRoutesQuery');

      const result = await mod.useRoutesQuery(
        { id: 'o' },
        { id: 'd' },
        'driving',
        { travelMode: 'driving', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
      );

      const data = result.data instanceof Promise ? await result.data : result.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].id).toBe('r-cache-2');
      // Verify track was called and one of the calls includes cacheHit true
      expect(mockedTrack).toHaveBeenCalled();
      const calledWithCacheHit = (mockedTrack.mock.calls || []).some((c: any[]) => c[0] && c[0].cacheHit === true);
      expect(calledWithCacheHit).toBe(true);
    });
  });
});
