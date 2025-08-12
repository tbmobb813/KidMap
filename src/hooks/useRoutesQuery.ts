import { useQuery } from '@tanstack/react-query';
import { fetchRoutes, FetchRoutesParams } from '@/services/routeService';
import { Place, TravelMode, RouteOptions } from '@/types/navigation';

export function useRoutesQuery(origin: Place | null, destination: Place | null, mode: TravelMode, options: RouteOptions) {
    return useQuery({
        queryKey: ['routes', origin?.id, destination?.id, mode, options.travelMode, options.avoidHighways, options.avoidTolls, options.accessibilityMode],
        queryFn: async () => {
            if (!origin || !destination) return [];
            const params: FetchRoutesParams = { origin, destination, mode, options };
            return fetchRoutes(params);
        },
        enabled: !!origin && !!destination,
        // Keep previous data to reduce loading flashes when params change slightly
        placeholderData: (previous) => previous ?? [],
    });
}
