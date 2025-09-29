import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock network status to be online by default
jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));

// Mock routeService fetchRoutes and metrics. Default fetch increments metrics
const mockMetrics = { fetchCount: 0 };
const mockFetch = jest.fn(async (_params?: any) => {
  // simulate network fetch side-effect: increment fetch counter
  mockMetrics.fetchCount += 1;
  return [{ id: 'r1' }];
});
jest.doMock('@/services/routeService', () => ({
  fetchRoutes: (params: any) => mockFetch(params),
  getRouteServiceMetrics: () => mockMetrics,
}));

// Mock telemetry to capture track calls
const mockTrack = jest.fn();
jest.doMock('@/telemetry/index', () => ({ track: (t: any) => mockTrack(t) }));

const { useRoutesQuery } = require('@/hooks/useRoutesQuery');

describe('useRoutesQuery queryFn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset metrics between tests
    mockMetrics.fetchCount = 0;
  });

  it('returns empty array when origin or destination is null', async () => {
    const qc = new QueryClient();
    const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);

    const { result } = renderHook(() => useRoutesQuery(null, null, 'walk' as any, {} as any), { wrapper });
    // When disabled, data should be initial placeholder []
    expect(result.current.data).toEqual([]);
  });

  it('calls fetchRoutes and tracks telemetry when origin/destination provided', async () => {
    const qc = new QueryClient();
    const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);

    const origin = { id: 'o1' } as any;
    const dest = { id: 'd1' } as any;

    const { result } = renderHook(() => useRoutesQuery(origin, dest, 'drive' as any, { travelMode: 'fast' } as any), { wrapper });

    // wait for the query to fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalled();
    // default implementation increments fetchCount -> cacheHit should be false
    expect(mockMetrics.fetchCount).toBeGreaterThanOrEqual(1);
    expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({ type: 'route_fetch', cacheHit: false }));
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('treats result as cache hit when metrics are unchanged by fetch', async () => {
    // Arrange: preset metrics and ensure this fetch does NOT increment it
    mockMetrics.fetchCount = 42;
    mockFetch.mockImplementationOnce(async () => {
      // do not change mockMetrics.fetchCount to simulate a cache hit
      return [{ id: 'cached_r' }];
    });

    const qc = new QueryClient();
    const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);

    const origin = { id: 'o1' } as any;
    const dest = { id: 'd1' } as any;

    const { result } = renderHook(() => useRoutesQuery(origin, dest, 'drive' as any, { travelMode: 'fast' } as any), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalled();
    // Since we didn't change the metric, cacheHit should be true
    expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({ type: 'route_fetch', cacheHit: true }));
    // Data shape may vary depending on query cache/placeholder logic; ensure fetch was called
    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles fetch errors and does not call telemetry', async () => {
    // Arrange: cause fetch to reject
    mockFetch.mockRejectedValueOnce(new Error('timeout'));

    const qc = new QueryClient();
    const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);

    const origin = { id: 'o1' } as any;
    const dest = { id: 'd1' } as any;

    const { result } = renderHook(() => useRoutesQuery(origin, dest, 'drive' as any, { travelMode: 'fast' } as any), { wrapper });

  // Wait for the fetch to be attempted then assert telemetry wasn't recorded
  await waitFor(() => expect(mockFetch).toHaveBeenCalled(), { timeout: 1500 });
  expect(mockTrack).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'route_fetch' }));
  });

  it('handles no-results (empty array) and still tracks telemetry', async () => {
    mockFetch.mockImplementationOnce(async () => {
      mockMetrics.fetchCount += 1;
      return [] as any[];
    });

    const qc = new QueryClient();
    const wrapper = ({ children }: any) => React.createElement(QueryClientProvider, { client: qc }, children);

    const origin = { id: 'o1' } as any;
    const dest = { id: 'd1' } as any;

    const { result } = renderHook(() => useRoutesQuery(origin, dest, 'drive' as any, { travelMode: 'fast' } as any), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({ type: 'route_fetch', cacheHit: false }));
  });
});
