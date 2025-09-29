describe('useRoutesQuery queryFn (isolated)', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('executes the queryFn and returns route data when online', async () => {
        await jest.isolateModulesAsync(async () => {
            // Mock useQuery so it immediately executes the provided queryFn
            jest.doMock('@tanstack/react-query', () => ({
                useQuery: (opts: any) => {
                    const data = opts.queryFn ? opts.queryFn() : [];
                    return { data };
                },
            }));

            // Mock network status to be online
            jest.doMock('@/hooks/useNetworkStatus', () => ({
                useNetworkStatus: () => ({ isConnected: true }),
            }));

            // Mock route service used by the queryFn
            jest.doMock('@/services/routeService', () => ({
                fetchRoutes: jest.fn(async () => [{ id: 'r-isolated-1', duration: 10 }]),
                getRouteServiceMetrics: () => ({ fetchCount: 0 }),
            }));

            // Mock telemetry so track calls are no-ops
            jest.doMock('@/telemetry', () => ({ track: () => {} }));

            // Require the hook after mocks are in place
             
            const mod = require('@/hooks/useRoutesQuery');

            // Call useRoutesQuery (it will use the mocked useQuery and run queryFn)
            const result = await mod.useRoutesQuery(
                { id: 'o1' },
                { id: 'd1' },
                'walking',
                { travelMode: 'walking', avoidHighways: false, avoidTolls: false, accessibilityMode: false }
            );

            // result.data may be a Promise or array depending on implementation
            const data = result.data instanceof Promise ? await result.data : result.data;
            expect(Array.isArray(data)).toBe(true);
            expect(data[0]).toHaveProperty('id', 'r-isolated-1');
        });
    });
});
