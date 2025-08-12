import { useQuery } from '@tanstack/react-query';
import { fetchRoutes, FetchRoutesParams } from '@/services/routeService';
import { Place, TravelMode, RouteOptions } from '@/types/navigation';
import { mark, measure } from '@/utils/performanceMarks';
import { getRouteServiceMetrics } from '@/services/routeService';

export function useRoutesQuery(origin: Place | null, destination: Place | null, mode: TravelMode, options: RouteOptions) {
    return useQuery({
        queryKey: ['routes', origin?.id, destination?.id, mode, options.travelMode, options.avoidHighways, options.avoidTolls, options.accessibilityMode],
        queryFn: async () => {
            if (!origin || !destination) return [];
            const keyId = `${origin.id}->${destination.id}:${mode}`;
            mark(`routes_fetch_start:${keyId}`);
            const params: FetchRoutesParams = { origin, destination, mode, options };
            const before = getRouteServiceMetrics().fetchCount;
            const result = await fetchRoutes(params);
            const after = getRouteServiceMetrics().fetchCount;
            if (after === before) {
                mark(`routes_cache_hit:${keyId}`);
            } else {
                mark(`routes_cache_miss:${keyId}`);
            }
            mark(`routes_fetch_end:${keyId}`);
            measure(`routes_fetch_duration:${keyId}`, `routes_fetch_start:${keyId}`, `routes_fetch_end:${keyId}`);
            return result;
        },
        enabled: !!origin && !!destination,
        // Keep previous data to reduce loading flashes when params change slightly
        placeholderData: (previous) => previous ?? [],
    });
}
