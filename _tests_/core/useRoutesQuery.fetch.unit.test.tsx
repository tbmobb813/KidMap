import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock network status to be online by default
jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));

// Mock routeService fetchRoutes and metrics
const mockFetch = jest.fn(async (_params?: any) => [{ id: 'r1' }]);
const mockMetrics = { fetchCount: 0 };
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
    expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({ type: 'route_fetch' }));
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
