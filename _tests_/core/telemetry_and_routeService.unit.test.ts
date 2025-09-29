import { __resetRouteServiceMetrics, getRouteServiceMetrics, fetchRoutes } from '@/services/routeService';

// Ensure we load the real telemetry implementation (jest.setup.js provides a
// global mock for '@/telemetry' which would otherwise shadow the real
// functions). Reset modules and use jest.requireActual to get the original
// module exports for deterministic testing.
beforeEach(() => {
  jest.resetModules();
});

const telemetry = jest.requireActual('../../src/telemetry/index.ts');
const setTelemetryAdapter = telemetry.setTelemetryAdapter;
const setTelemetryEnabled = telemetry.setTelemetryEnabled;
const time = telemetry.time;
const getTelemetryAdapter = telemetry.getTelemetryAdapter;

describe('telemetry helpers', () => {
  it('records events to a memory-like adapter when enabled', async () => {
    const mem: any = { events: [] as any[], record(e: any) { this.events.push(e); }, flush: () => {} };
    setTelemetryAdapter(mem);
    setTelemetryEnabled(true);

    // use time to emit a route_fetch telemetry event
    await time('route_fetch', async () => Promise.resolve('ok'), { mode: 'walking', cacheHit: true });

    const current = getTelemetryAdapter() as any;
    expect(Array.isArray(current.events)).toBe(true);
    expect(current.events.length).toBeGreaterThanOrEqual(1);
    expect(current.events[0].type).toBeDefined();
    current.events = [];
  });

  it('respects telemetry disabled flag', async () => {
    const mem: any = { events: [], record(e: any) { this.events.push(e); }, flush: () => {} };
    setTelemetryAdapter(mem);
    setTelemetryEnabled(false);

    await time('route_fetch', async () => Promise.resolve('ok'), { mode: 'driving' });
    const current = getTelemetryAdapter() as any;
    expect(current.events.length).toBe(0);
  });
});

describe('routeService metrics and fetch', () => {
  it('increments fetchCount when fetchRoutes is called', async () => {
    __resetRouteServiceMetrics();
    const before = getRouteServiceMetrics().fetchCount;
    // call fetchRoutes with sample route params
    const res = await fetchRoutes({ origin: { id: 'o', name: 'O' } as any, destination: { id: 'd', name: 'D' } as any, mode: 'walking' as any, options: {} as any });
    const after = getRouteServiceMetrics().fetchCount;
    expect(Array.isArray(res)).toBe(true);
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });
});
