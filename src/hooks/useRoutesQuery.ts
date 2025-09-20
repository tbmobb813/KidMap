import { useQuery } from "@tanstack/react-query";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  fetchRoutes,
  FetchRoutesParams,
  getRouteServiceMetrics,
} from "@/services/routeService";
import { track } from "@/telemetry/index";
import { Place, RouteOptions, TravelMode } from "@/types/navigation";
import { mark, measure } from "@/utils/performance/performanceMarks";

export function useRoutesQuery(
  origin: Place | null,
  destination: Place | null,
  mode: TravelMode,
  options: RouteOptions
) {
  const { isConnected } = useNetworkStatus();

  return useQuery({
    queryKey: [
      "routes",
      origin?.id,
      destination?.id,
      mode,
      options.travelMode,
      options.avoidHighways,
      options.avoidTolls,
      options.accessibilityMode,
    ],
    queryFn: async () => {
      if (!origin || !destination) return [];
      const keyId = `${origin.id}->${destination.id}:${mode}`;
      mark(`routes_fetch_start:${keyId}`);
      const startTs = Date.now();
      const params: FetchRoutesParams = { origin, destination, mode, options };
      const before = getRouteServiceMetrics().fetchCount;
      const result = await fetchRoutes(params);
      const after = getRouteServiceMetrics().fetchCount;
      const cacheHit = after === before;
      if (cacheHit) mark(`routes_cache_hit:${keyId}`);
      else mark(`routes_cache_miss:${keyId}`);
      mark(`routes_fetch_end:${keyId}`);
      measure(
        `routes_fetch_duration:${keyId}`,
        `routes_fetch_start:${keyId}`,
        `routes_fetch_end:${keyId}`
      );
      track({
        type: "route_fetch",
        mode,
        durationMs: Date.now() - startTs,
        cacheHit,
      });
      // Update last event with computed duration from marks if needed (simple approach: emit separate event)
      return result;
    },
    enabled: !!origin && !!destination,
    // Offline-first behavior: use cached data when offline
    networkMode: isConnected ? "online" : "offlineFirst",
    // Keep previous data to reduce loading flashes when params change slightly
    placeholderData: (previous) => previous ?? [],
    // Extended stale time when offline to prefer cached data
    staleTime: isConnected ? 30_000 : 10 * 60 * 1000, // 10 minutes when offline
  });
}
