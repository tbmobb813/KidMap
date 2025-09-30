/**
 * Focused unit test for useRoutesQuery.fetch behavior.
 * Ensures the route service fetchRoutes is invoked and queryFn returns result.
 * Uses isolateModules + jest.doMock to attach spies to the same module instance used by the hook.
 */

import { jest } from '@jest/globals';

describe('useRoutesQuery - fetch behavior', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('calls fetchRoutes when origin and destination are provided', async () => {
    let api: any = null;

    jest.isolateModules(() => {
      const React = require('react');
      const renderer = require('react-test-renderer');
      const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');

      const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });

      // Mock network status to be connected
      jest.doMock('@/hooks/useNetworkStatus', () => ({
        useNetworkStatus: () => ({ isConnected: true }),
      }));

      // Mock route service with a spy for fetchRoutes and simple metrics
  const mockFetch: any = jest.fn().mockResolvedValue([{ id: 'r1' }]);
      let fetchCount = 0;
      const getRouteServiceMetrics = () => ({ fetchCount });
      // The fetchRoutes implementation increments fetchCount when called
      const fetchRoutesImpl = async (params: any) => {
        fetchCount += 1;
        return mockFetch(params);
      };

      jest.doMock('@/services/routeService', () => ({
        fetchRoutes: fetchRoutesImpl,
        getRouteServiceMetrics,
      }));

      // Require the hook after setting up mocks
      const { useRoutesQuery } = require('@/hooks/useRoutesQuery');

      const TestComp: React.FC<{ onReady: (api: any) => void }> = ({ onReady }) => {
        const q = useRoutesQuery(
          { id: 'o', name: 'O' },
          { id: 'd', name: 'D' },
          'driving',
          { travelMode: 'fastest', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
        );
        React.useEffect(() => onReady(q), [q, onReady]);
        return null;
      };

      const wrapped = React.createElement(
        QueryClientProvider,
        { client: qc },
        React.createElement(TestComp, { onReady: (a: any) => (api = a) })
      );
      const rendered = renderer.create(wrapped);
      // keep renderer around for cleanup
      (rendered as any).__unmount = () => rendered.unmount();
    });

    // Wait for the api to be set
    await new Promise<void>((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (api != null) return resolve();
        if (Date.now() - start > 2000) return reject(new Error('timeout waiting for hook'));
        setTimeout(tick, 10);
      };
      tick();
    });

    expect(api).not.toBeNull();
    // The query object should have a fetchStatus or data; ensure fetchRoutes spy was called
    // Since fetchRoutes increments fetchCount we can assert it's >= 1
    // Allow some time for the async queryFn to run
    await new Promise((r) => setTimeout(r, 50));

    // Access the mocked service via require to inspect the mock
    const svc = require('@/services/routeService');
    // The underlying mockFetch was created in the module; verify fetchCount incremented
    const metrics = svc.getRouteServiceMetrics();
    expect(metrics.fetchCount).toBeGreaterThanOrEqual(1);

    // Clean up renderer if present
    if (api && api?.stop) api.stop?.();
  });
});
