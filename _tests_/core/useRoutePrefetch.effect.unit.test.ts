describe('useRoutePrefetch effect behavior', () => {
  it('calls client.prefetchQuery when origin and destination exist', async () => {
    await jest.isolateModulesAsync(async () => {
      // mock React.useEffect to run synchronously
      jest.doMock('react', () => ({
        ...(jest.requireActual('react')),
        useEffect: (fn: any) => fn(),
      }));

      const prefetchCalled: any[] = [];
      const client = {
        getQueryState: () => undefined,
        prefetchQuery: jest.fn(async ({ queryKey, queryFn }: any) => {
          prefetchCalled.push(queryKey);
          return queryFn();
        }),
      };

      jest.doMock('@tanstack/react-query', () => ({
        useQueryClient: () => client,
      }));

      jest.doMock('@/stores/navigationStore', () => ({
        useNavigationStore: () => ({
          origin: { id: 'o1' },
          destination: { id: 'd1' },
          selectedTravelMode: 'driving',
          routeOptions: { travelMode: 'driving', avoidHighways: false, avoidTolls: false, accessibilityMode: false },
        }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn(async () => [{ id: 'r1' }]),
      }));

      jest.doMock('@/telemetry', () => ({ track: jest.fn() }));
      jest.doMock('@/utils/performance/performanceMarks', () => ({ mark: jest.fn() }));

      const mod = require('@/hooks/useRoutePrefetch');

      // Call the hook - mocked useEffect runs immediately and should trigger prefetch
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = mod.useRoutePrefetch();

      // allow any pending microtasks
      await Promise.resolve();

      expect(client.prefetchQuery).toHaveBeenCalled();
      expect(prefetchCalled.length).toBeGreaterThan(0);
    });
  });

  it('does not call prefetchQuery when origin or destination missing', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('react', () => ({
        ...(jest.requireActual('react')),
        useEffect: (fn: any) => fn(),
      }));

      const client = {
        getQueryState: () => undefined,
        prefetchQuery: jest.fn(async () => []),
      };

      jest.doMock('@tanstack/react-query', () => ({
        useQueryClient: () => client,
      }));

      jest.doMock('@/stores/navigationStore', () => ({
        useNavigationStore: () => ({
          origin: null,
          destination: null,
          selectedTravelMode: 'walking',
          routeOptions: { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false },
        }),
      }));

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: jest.fn(async () => [{ id: 'x' }]),
      }));

      const mod = require('@/hooks/useRoutePrefetch');

      // Call the hook; mocked useEffect runs immediately
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = mod.useRoutePrefetch();

      // allow microtasks
      await Promise.resolve();

      expect(client.prefetchQuery).not.toHaveBeenCalled();
    });
  });
});
