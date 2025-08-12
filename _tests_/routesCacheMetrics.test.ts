import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRoutesQuery } from '@/src/hooks/useRoutesQuery';
import { __resetRouteServiceMetrics, getRouteServiceMetrics } from '@/services/routeService';

jest.mock('@/services/routeService', () => {
    const actual = jest.requireActual('@/services/routeService');
    return {
        ...actual,
        fetchRoutes: jest.fn(actual.fetchRoutes),
    };
});

const origin = { id: 'o1', name: 'Origin', address: '', category: 'other', coordinates: { latitude: 0, longitude: 0 } } as any;
const destination = { id: 'd1', name: 'Destination', address: '', category: 'other', coordinates: { latitude: 1, longitude: 1 } } as any;
const options = { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false } as any;

function ComponentOnce() {
    useRoutesQuery(origin, destination, 'transit', options);
    return null;
}

function createClient() {
    return new QueryClient({
        defaultOptions: { queries: { retry: 0, staleTime: 10000 } }
    });
}

describe('Routes cache metrics', () => {
    beforeEach(() => __resetRouteServiceMetrics());

    it('increments fetch count only on first distinct fetch (cache reuse on remount)', async () => {
        const client = createClient();
        const { unmount, rerender } = render(
            <QueryClientProvider client={ client } >
            <ComponentOnce />
        </QueryClientProvider>
        );
        await waitFor(() => expect(getRouteServiceMetrics().fetchCount).toBe(1), { timeout: 4000 });
        unmount();
        rerender(
            <QueryClientProvider client={ client } >
            <ComponentOnce />
        </QueryClientProvider>
        );
        await new Promise(r => setTimeout(r, 200));
        expect(getRouteServiceMetrics().fetchCount).toBe(1);
    }, 10000);
});
