describe('useRoutesQuery options (networkMode/staleTime/placeholderData)', () => {
  it('sets networkMode=online and short staleTime when connected', () => {
    jest.isolateModules(() => {
      let captured: any = null;

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => {
          captured = opts;
          return { data: [] };
        },
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn(async () => []),
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
      }));

      const mod = require('@/hooks/useRoutesQuery');

      // Call the hook function and ignore the return; our mock captures opts
      // Provide valid origin/destination to ensure enabled=true
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const out = mod.useRoutesQuery({ id: 'o' }, { id: 'd' }, 'walking', {
        travelMode: 'walking',
        avoidHighways: false,
        avoidTolls: false,
        accessibilityMode: false,
      });

      expect(captured).toBeDefined();
      expect(captured.networkMode).toBe('online');
      expect(captured.staleTime).toBe(30_000);
      expect(typeof captured.placeholderData).toBe('function');
      // placeholderData should return previous or [] — when previous is undefined, return []
      expect(captured.placeholderData(undefined)).toEqual([]);
      expect(captured.enabled).toBe(true);
    });
  });

  it('sets networkMode=offlineFirst and long staleTime when offline', () => {
    jest.isolateModules(() => {
      let captured: any = null;

      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => {
          captured = opts;
          return { data: [] };
        },
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: false }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn(async () => []),
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
      }));

      const mod = require('@/hooks/useRoutesQuery');

      // Call the hook to trigger the mocked useQuery
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _out = mod.useRoutesQuery({ id: 'o' }, { id: 'd' }, 'walking', {
        travelMode: 'walking',
        avoidHighways: false,
        avoidTolls: false,
        accessibilityMode: false,
      });

      expect(captured).toBeDefined();
      expect(captured.networkMode).toBe('offlineFirst');
      expect(captured.staleTime).toBe(10 * 60 * 1000);
      expect(typeof captured.placeholderData).toBe('function');
      expect(captured.placeholderData(undefined)).toEqual([]);
      expect(captured.enabled).toBe(true);
    });
  });
});
