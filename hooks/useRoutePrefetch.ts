import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchRoutes } from '@/services/routeService';
import { useNavigationStore } from '@/stores/navigationStore';
import { Place, TravelMode, RouteOptions } from '@/types/navigation';
import { mark } from '@/utils/performanceMarks';

// Prefetch route variants for other travel modes to speed up mode switching.
export async function prefetchRouteVariants(
    client: ReturnType<typeof useQueryClient>,
    origin: Place,
    destination: Place,
    excludeMode: TravelMode,
    baseOptions: RouteOptions
) {
    const modes: TravelMode[] = ['transit', 'walking', 'biking', 'driving'];
    const targets = modes.filter(m => m !== excludeMode);
    await Promise.all(targets.map(async mode => {
        // Build query key structure mirroring useRoutesQuery
        const key = ['routes', origin.id, destination.id, mode, mode, baseOptions.avoidHighways, baseOptions.avoidTolls, baseOptions.accessibilityMode];
        if (client.getQueryState(key)) return; // already cached
        mark(`routes_prefetch_start:${origin.id}->${destination.id}:${mode}`);
        await client.prefetchQuery({
            queryKey: key,
            queryFn: () => fetchRoutes({ origin, destination, mode, options: { ...baseOptions, travelMode: mode } })
        });
        mark(`routes_prefetch_end:${origin.id}->${destination.id}:${mode}`);
    }));
}

export function useRoutePrefetch() {
    const client = useQueryClient();
    const { origin, destination, selectedTravelMode, routeOptions } = useNavigationStore(s => ({
        origin: s.origin,
        destination: s.destination,
        selectedTravelMode: s.selectedTravelMode,
        routeOptions: s.routeOptions,
    }));

    useEffect(() => {
        if (!origin || !destination) return;
        // Fire and forget; performance marks capture timing in dev
        prefetchRouteVariants(client, origin, destination, selectedTravelMode, routeOptions).catch(() => { });
    }, [client, origin?.id, destination?.id, selectedTravelMode, routeOptions.avoidHighways, routeOptions.avoidTolls, routeOptions.accessibilityMode]);
}
