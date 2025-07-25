import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const API_TIMEOUT = 10000; // 10 seconds

type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    AsyncStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    AsyncStorage.removeItem('auth_token');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Specific API functions
export const transitApi = {
  getRoutes: (from: string, to: string) => 
    apiClient.get(`/transit/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  
  getLiveArrivals: (stopId: string) => 
    apiClient.get(`/transit/arrivals/${stopId}`),
  
  getStops: (lat: number, lng: number, radius: number = 500) => 
    apiClient.get(`/transit/stops?lat=${lat}&lng=${lng}&radius=${radius}`),
};

export const placesApi = {
  search: (query: string, location?: { lat: number; lng: number }) => 
    apiClient.get(`/places/search?q=${encodeURIComponent(query)}${location ? `&lat=${location.lat}&lng=${location.lng}` : ''}`),
  
  getDetails: (placeId: string) => 
    apiClient.get(`/places/${placeId}`),
  
  getNearby: (lat: number, lng: number, type?: string) => 
    apiClient.get(`/places/nearby?lat=${lat}&lng=${lng}${type ? `&type=${type}` : ''}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  getAchievements: () => apiClient.get('/user/achievements'),
  checkIn: (placeId: string, photo?: string) => 
    apiClient.post('/user/checkin', { placeId, photo }),
};

// Offline support
export const offlineStorage = {
  async cacheResponse<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  },

  async getCachedResponse<T>(key: string, maxAge: number = 5 * 60 * 1000): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cached response:', error);
      return null;
    }
  },

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

// Network-aware API wrapper
export const createNetworkAwareApi = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<ApiResponse<R>>,
  cacheKey: string,
  maxAge?: number
) => {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      // Try network request first
      const response = await apiFunction(...args);
      
      // Cache successful response
      if (response.success) {
        await offlineStorage.cacheResponse(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      // Fallback to cache on network error
      console.warn('Network request failed, trying cache:', error);
      
      const cached = await offlineStorage.getCachedResponse<ApiResponse<R>>(cacheKey, maxAge);
      if (cached) {
        return {
          ...cached,
          message: 'Showing cached data (offline)',
        };
      }
      
      throw error;
    }
  };
};

// --- Multi-Modal Routing: Mapbox Directions API ---
// Docs: https://docs.mapbox.com/api/navigation/directions/

export type TravelMode = 'walking' | 'cycling' | 'driving' | 'transit';

export type RouteLeg = {
  summary: string;
  steps: Array<{
    maneuver: { instruction: string; location: [number, number] };
    distance: number;
    duration: number;
    name: string;
  }>;
  distance: number;
  duration: number;
};

export type RouteResult = {
  legs: RouteLeg[];
  distance: number;
  duration: number;
  geometry: any;
  mode: TravelMode;
};


const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; // TODO: Move to env/config
const GOOGLE_MAPS_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // TODO: Move to env/config

// Google Directions API for transit
export async function fetchGoogleTransitRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteResult | null> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from[1]},${from[0]}&destination=${to[1]},${to[0]}&mode=transit&key=${GOOGLE_MAPS_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Parse Google steps to RouteLegs
      const legs: RouteLeg[] = route.legs.map((leg: any) => ({
        summary: leg.summary || '',
        steps: leg.steps.map((step: any) => ({
          maneuver: {
            instruction: step.html_instructions || '',
            location: [step.start_location.lng, step.start_location.lat],
          },
          distance: step.distance.value,
          duration: step.duration.value,
          name: step.transit_details?.line?.short_name || step.travel_mode,
        })),
        distance: leg.distance.value,
        duration: leg.duration.value,
      }));
      return {
        legs,
        distance: route.legs[0].distance.value,
        duration: route.legs[0].duration.value,
        geometry: route.overview_polyline,
        mode: 'transit',
      };
    }
    return null;
  } catch (e) {
    console.warn('Failed to fetch Google transit route:', e);
    return null;
  }
}

// Unified fetchRoute for all modes
export async function fetchRoute(
  from: [number, number],
  to: [number, number],
  mode: TravelMode = 'walking'
): Promise<RouteResult | null> {
  if (mode === 'transit') {
    return fetchGoogleTransitRoute(from, to);
  }
  // Mapbox for other modes
  const profile = mode === 'walking' ? 'walking' : mode === 'cycling' ? 'cycling' : mode === 'driving' ? 'driving' : 'driving';
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        legs: route.legs,
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        mode,
      };
    }
    return null;
  } catch (e) {
    console.warn('Failed to fetch route:', e);
    return null;
  }
}
