import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
  Constants.expoConfig?.ios?.config?.googleMapsApiKey ||
  // No fallback: API key must be provided via environment/config

// utils/api.ts - Google Maps integration
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

export type TravelMode = 'walking' | 'bicycling' | 'transit' | 'driving';

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  travelMode: TravelMode;
  transitDetails?: {
    line: string;
    agency: string;
    vehicle: string;
    color?: string;
    stops: number;
    departureTime: string;
    arrivalTime: string;
  };
}

export interface RouteResult {
  steps: RouteStep[];
  totalDistance: number; // meters
  totalDuration: number; // seconds
  mode: TravelMode;
  overview_polyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

/**
 * Fetches a route between two coordinates using Google Maps Directions API
 */
export async function fetchRoute(
  from: [number, number], // [lat, lng]
  to: [number, number],   // [lat, lng]
  mode: TravelMode = 'walking',
): Promise<RouteResult | null> {
  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/directions/json` +
      `?origin=${from[0]},${from[1]}` +
      `&destination=${to[0]},${to[1]}` +
      `&mode=${mode}` +
      `&alternatives=false` +
      `&units=metric` +
      `&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('Fetching route:', { from, to, mode, url: url.replace(GOOGLE_MAPS_API_KEY, '[API_KEY]') });
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.routes?.length) {
      console.error('Route fetch failed:', data.status, data.error_message);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    
    const steps: RouteStep[] = leg.steps.map((step: any, index: number) => {
      const baseStep: RouteStep = {
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.value,
        duration: step.duration.value,
        startLocation: step.start_location,
        endLocation: step.end_location,
        travelMode: step.travel_mode.toLowerCase() as TravelMode,
      };

      // Add transit details if this is a transit step
      if (step.travel_mode === 'TRANSIT' && step.transit_details) {
        const transit = step.transit_details;
        baseStep.transitDetails = {
          line: transit.line.short_name || transit.line.name,
          agency: transit.line.agencies[0]?.name || 'Transit',
          vehicle: transit.line.vehicle.name,
          color: transit.line.color ? `#${transit.line.color}` : '#0078d4',
          stops: transit.num_stops || 0,
          departureTime: transit.departure_time.text,
          arrivalTime: transit.arrival_time.text,
        };
      }

      return baseStep;
    });

    return {
      steps,
      totalDistance: leg.distance.value,
      totalDuration: leg.duration.value,
      mode,
      overview_polyline: route.overview_polyline.points,
      bounds: route.bounds,
    };

  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}

/**
 * Place search result from Google Places API
 */
export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  types: string[];
  rating?: number;
  price_level?: number;
}

/**
 * Search for places using Google Places API
 */
export async function searchPlaces(
  query: string,
  location?: { lat: number; lng: number },
  radius: number = 5000
): Promise<PlaceResult[]> {
  try {
    let url = `${GOOGLE_MAPS_BASE_URL}/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`;
    }
    
    console.log('Searching places:', { query, location, radius });
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Places search failed:', data.status, data.error_message);
      return [];
    }
    
    return data.results || [];
    
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Get nearby transit stations using Google Places API
 */
export async function getNearbyTransitStations(
  location: { lat: number; lng: number },
  radius: number = 1000
): Promise<PlaceResult[]> {
  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json` +
      `?location=${location.lat},${location.lng}` +
      `&radius=${radius}` +
      `&type=transit_station` +
      `&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('Finding nearby transit stations:', { location, radius });
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Transit station search failed:', data.status, data.error_message);
      return [];
    }
    
    return data.results || [];
    
  } catch (error) {
    console.error('Error finding transit stations:', error);
    return [];
  }
}
