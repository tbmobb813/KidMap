// This test file uses isolated module loads and per-test doMock to ensure the
// hook's imports see the test doubles. We stub `@tanstack/react-query`'s
// `useQuery` to synchronously invoke the hook's queryFn so we can assert behavior.

describe('useRoutesQuery (isolated)', () => {
  beforeEach(() => jest.resetModules());

  it('returns disabled query when origin/destination are null', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => ({ ...opts, data: opts.queryFn ? opts.queryFn() : [], enabled: opts.enabled, isSuccess: true }),
      }));
      jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));

      const { useRoutesQuery } = require('@/hooks/useRoutesQuery');
      const res = await useRoutesQuery(null, null, 'transit', { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      expect(res.enabled).toBe(false);
      const data = res.data instanceof Promise ? await res.data : res.data;
      expect(Array.isArray(data)).toBe(true);
    });
  });

  it('calls fetchRoutes when both origin and destination provided', async () => {
    await jest.isolateModulesAsync(async () => {
      const fetchMock = jest.fn().mockResolvedValue([{ id: 'r1' }]);
      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: fetchMock,
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
      }));

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => ({ ...opts, data: opts.queryFn ? opts.queryFn() : [], enabled: opts.enabled, isSuccess: true }),
      }));
      jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));

      const { useRoutesQuery } = require('@/hooks/useRoutesQuery');
      const origin = { id: 'o1', name: 'Origin' } as any;
      const dest = { id: 'd1', name: 'Dest' } as any;

      const res = await useRoutesQuery(origin, dest, 'transit', { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);
      const data = res.data instanceof Promise ? await res.data : res.data;
      expect(Array.isArray(data)).toBe(true);
      // Ensure the mocked service was called
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
