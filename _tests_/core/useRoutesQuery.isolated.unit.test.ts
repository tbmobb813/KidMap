describe('useRoutesQuery isolated - execute queryFn via mocked useQuery', () => {
  it('executes internal queryFn logic and returns fetched routes', async () => {
    // isolate module loading so our mocks apply before the hook is required
    jest.isolateModules(async () => {
      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => {
          // immediately run the queryFn to exercise internal code paths
          const data = opts.queryFn ? opts.queryFn() : [];
          return { data };
        },
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn(async () => [{ id: 'r-isolated', duration: 42 }]),
        getRouteServiceMetrics: () => ({ fetchCount: 0 }),
      }));

      // Require the hook module after mocking so code runs under our mocks
      const mod = require('@/hooks/useRoutesQuery');

      // Call the exported function (it will use our mocked useQuery and run queryFn)
      const result = await mod.useRoutesQuery(
        { id: 'o1' },
        { id: 'd1' },
        'walking',
        { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
      );

      // The mocked useQuery runs the async queryFn; result.data may be a Promise
      expect(result.data).toBeDefined();
      const data = result.data instanceof Promise ? await result.data : result.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].id).toBe('r-isolated');
    });
  });
});
