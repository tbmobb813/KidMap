import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
  Constants.expoConfig?.ios?.config?.googleMapsApiKey ||
  Constants.expoConfig?.extra?.googleMapsApiKey;

// utils/api.ts - simple routing stub for testing
const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

// utils/api.ts - minimal routing stub to satisfy tests
export type TravelMode = 'walking' | 'cycling' | 'transit';

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  startLocation: [number, number];
  endLocation: [number, number];
  line?: string; // e.g. bus/train line for transit
  mode: TravelMode;
}

export interface RouteResult {
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
  mode: TravelMode;
}

/**
 * Fetches a route between two coordinates in the specified mode.
 * Returns the first route or null if none or on error.
 */
export async function fetchRoute(
  from: [number, number],
  to: [number, number],
  mode: TravelMode = 'walking',
): Promise<RouteResult | null> {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${from[0]},${from[1]}` +
      `&destination=${to[0]},${to[1]}` +
      `&mode=${mode}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const json = await resp.json();
    if (json.status !== 'OK' || !json.routes?.length) return null;

    const leg = json.routes[0].legs[0];
    const steps: RouteStep[] = leg.steps.map((s: any) => ({
      instruction: s.html_instructions.replace(/<[^>]+>/g, ''),
      distance: s.distance.value,
      duration: s.duration.value,
      startLocation: [s.start_location.lat, s.start_location.lng],
      endLocation: [s.end_location.lat, s.end_location.lng],
      mode,
      line: s.transit_details?.line?.short_name,
    }));

    return {
      mode,
      totalDistance: leg.distance.value,
      totalDuration: leg.duration.value,
      steps,
    };
  } catch (e) {
    console.error('fetchRoute error', e);
    return null;
  }
}
