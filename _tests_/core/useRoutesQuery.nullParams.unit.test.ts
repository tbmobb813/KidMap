describe('useRoutesQuery - null params behavior', () => {
  it('returns empty data and disabled when origin or destination is null', async () => {
    jest.isolateModules(async () => {
      jest.doMock('@tanstack/react-query', () => ({
        useQuery: (opts: any) => {
          // return the options object so tests can assert config like `enabled`
          return { ...opts, data: opts.queryFn ? opts.queryFn() : [] };
        },
      }));

      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      const mod = require('@/hooks/useRoutesQuery');

      const res = await mod.useRoutesQuery(
        null,
        { id: 'd1' },
        'driving',
        { travelMode: 'driving', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
      );

      // when origin is null the hook should be disabled and queryFn should yield []
      expect(res.enabled).toBe(false);
      const data = res.data instanceof Promise ? await res.data : res.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });
});
