import { fetchRoute, TravelMode, RouteResult } from '@/utils/api';

describe('fetchRoute stub', () => {
  const from = [0, 0] as [number, number];
  const to = [1, 1] as [number, number];

  it('resolves a RouteResult with correct shape for walking', async () => {
    const result = await fetchRoute(from, to, 'walking');
    expect(result).not.toBeNull();
    expect((result as RouteResult).mode).toBe('walking');
    expect((result as RouteResult).steps).toHaveLength(3);
    const [first] = (result as RouteResult).steps;
    expect(first.startLocation).toEqual(from);
    expect(first.endLocation).toEqual([from[0] + 0.001, from[1] + 0.001]);
  });

  it('includes a line property only for transit mode', async () => {
    const walk = await fetchRoute(from, to, 'walking');
    const transit = await fetchRoute(from, to, 'transit');
    expect(walk?.steps[1].line).toBeUndefined();
    expect(transit?.steps[1].line).toBe('Bus 42');
  });

  it('returns null on network error', async () => {
    // temporarily override fetch to throw
    const real = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.reject(new Error('fail'));
    const err = await fetchRoute(from, to, 'walking');
    expect(err).toBeNull();
    global.fetch = real;
  });
});
