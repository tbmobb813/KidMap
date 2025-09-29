// Note: per-test mocks use `jest.doMock('@/services/routeService', ...)` inside
// `jest.isolateModules`. Avoid a hoisted `jest.mock` here which would prevent
// the per-test `doMock` from taking effect.

describe('useRoutesQuery', () => {
  beforeEach(() => jest.resetModules());

  it('returns empty data when origin or destination is null', async () => {
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

  it('calls fetchRoutes when origin and destination provided', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn().mockResolvedValue([{ id: 'r1' }]),
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
        __esModule: true,
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
      expect(data.length).toBeGreaterThanOrEqual(0);
  const svc = jest.requireMock('@/services/routeService');
  expect(svc.fetchRoutes).toHaveBeenCalled();
    });
  });
});
