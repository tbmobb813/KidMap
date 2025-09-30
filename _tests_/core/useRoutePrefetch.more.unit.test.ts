import { prefetchRouteVariants } from '@/hooks/useRoutePrefetch';

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn(async () => [{ id: 'r1' }]),
}));

describe('prefetchRouteVariants', () => {
  it('calls prefetchQuery for missing cache keys', async () => {
    const client: any = {
      getQueryState: () => undefined,
      prefetchQuery: jest.fn().mockResolvedValue(undefined),
    };

    const origin = { id: 'o' } as any;
    const destination = { id: 'd' } as any;
    await prefetchRouteVariants(client, origin, destination, 'walking' as any, { avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any);

    expect(client.prefetchQuery).toHaveBeenCalled();
  });
});
