import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { fetchRoutes } from "@/services/routeService";
import { useNavigationStore } from "@/stores/navigationStore";
import { track } from "@/telemetry";
import { Place, RouteOptions, TravelMode } from "@/types/navigation";
import { mark } from "@/utils/performance/performanceMarks";

// User behavior tracking for intelligent prefetching
type UserPattern = {
  commonModes: TravelMode[];
  preferredTimes: string[];
  frequentRoutes: string[];
  lastSwitches: Array<{ from: TravelMode; to: TravelMode; timestamp: number }>;
};

// Simple pattern detection (in production, this would use ML/analytics)
function getUserPrefetchPatterns(): UserPattern {
  // Heuristic: Most users switch from transit to walking/biking
  // Time-based: Morning prefers faster modes, evening prefers safer modes
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const isEvening = hour >= 18;

  return {
    commonModes: isRushHour
      ? ["transit", "walking"]
      : ["walking", "biking", "transit"],
    preferredTimes: isEvening ? ["safest", "shortest"] : ["fastest", "scenic"],
    frequentRoutes: [], // Would be populated from usage analytics
    lastSwitches: [], // Would track actual user behavior
  };
}

// Intelligent prefetch route variants based on user patterns and heuristics
export async function prefetchRouteVariants(
  client: ReturnType<typeof useQueryClient>,
  origin: Place,
  destination: Place,
  excludeMode: TravelMode,
  baseOptions: RouteOptions
) {
  const patterns = getUserPrefetchPatterns();
  const modes: TravelMode[] = ["transit", "walking", "biking", "driving"];

  // Intelligent prioritization based on user patterns
  const prioritizedModes = modes
    .filter((m) => m !== excludeMode)
    .sort((a, b) => {
      const aIndex = patterns.commonModes.indexOf(a);
      const bIndex = patterns.commonModes.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

  track({ type: "route_prefetch_start", mode: excludeMode });

  await Promise.all(
    prioritizedModes.map(async (mode, index) => {
      // Build query key structure mirroring useRoutesQuery
      const key = [
        "routes",
        origin.id,
        destination.id,
        mode,
        mode,
        baseOptions.avoidHighways,
        baseOptions.avoidTolls,
        baseOptions.accessibilityMode,
      ];
      if (client.getQueryState(key)) return; // already cached

      // Stagger prefetches to avoid overwhelming the network
      const delay = index * 200; // 200ms between prefetches
      await new Promise((resolve) => setTimeout(resolve, delay));

      mark(`routes_prefetch_start:${origin.id}->${destination.id}:${mode}`);
      track({ type: "route_prefetch_start", mode });
      const start = Date.now();
      await client.prefetchQuery({
        queryKey: key,
        queryFn: () =>
          fetchRoutes({
            origin,
            destination,
            mode,
            options: { ...baseOptions, travelMode: mode },
          }),
      });
      const durationMs = Date.now() - start;
      mark(`routes_prefetch_end:${origin.id}->${destination.id}:${mode}`);
      track({ type: "route_prefetch_complete", mode, durationMs });
    })
  );
}

export function useRoutePrefetch() {
  const client = useQueryClient();
  const { origin, destination, selectedTravelMode, routeOptions } =
    useNavigationStore((s) => ({
      origin: s.origin,
      destination: s.destination,
      selectedTravelMode: s.selectedTravelMode,
      routeOptions: s.routeOptions,
    }));

  useEffect(() => {
    if (!origin || !destination) return;
    // Fire and forget; performance marks capture timing in dev
    prefetchRouteVariants(
      client,
      origin,
      destination,
      selectedTravelMode,
      routeOptions
    ).catch(() => {});
  }, [client, origin, destination, selectedTravelMode, routeOptions]);
}
