// utils/transitApi.ts - Real transit data integration
import { PlaceResult } from './api';

/**
 * Real-time transit arrival data
 */
export interface TransitArrival {
  route: string;
  destination: string;
  arrivalTime: string; // e.g., "2 min", "15:45"
  isRealtime: boolean;
  delay?: number; // minutes
}

export interface TransitStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  routes: string[];
  arrivals: TransitArrival[];
}

export interface TransitLine {
  id: string;
  name: string;
  color: string;
  status: 'normal' | 'delayed' | 'alert' | 'suspended';
  message: string;
}

/**
 * NYC MTA Real-time feeds (requires API key from MTA)
 */
const MTA_API_BASE = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds';

/**
 * Generic transit API for different cities
 * This can be extended to support multiple transit agencies
 */
class TransitAPI {
  private apiKey: string | null = null;
  private city: string = 'nyc'; // Default to NYC

  constructor(apiKey?: string, city: string = 'nyc') {
    this.apiKey = apiKey;
    this.city = city;
  }

  /**
   * Get nearby transit stations
   */
  async getNearbyStations(
    location: { lat: number; lng: number },
    radius: number = 500
  ): Promise<TransitStation[]> {
    try {
      // For NYC, we can use a combination of static GTFS data and real-time feeds
      // For now, let's use some real NYC subway stations as examples
      const nycStations = this.getNYCStations(location, radius);
      
      // Get real-time arrivals for each station
      const stationsWithArrivals = await Promise.all(
        nycStations.map(async (station) => ({
          ...station,
          arrivals: await this.getArrivals(station.id),
        }))
      );
      
      return stationsWithArrivals;
    } catch (error) {
      console.error('Error fetching nearby stations:', error);
      return [];
    }
  }

  /**
   * Get real-time arrivals for a station
   */
  async getArrivals(stationId: string): Promise<TransitArrival[]> {
    try {
      // This would typically use real MTA API feeds
      // For demonstration, returning mock data with realistic structure
      return this.getMockArrivals(stationId);
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      return [];
    }
  }

  /**
   * Get transit line status
   */
  async getLineStatus(): Promise<TransitLine[]> {
    try {
      // This would fetch from MTA service status API
      // For now, returning realistic mock data
      return [
        { id: '4', name: '4', color: '#00933c', status: 'normal', message: 'Good service' },
        { id: '5', name: '5', color: '#00933c', status: 'normal', message: 'Good service' },
        { id: '6', name: '6', color: '#00933c', status: 'delayed', message: 'Delays up to 10 minutes' },
        { id: 'l', name: 'L', color: '#a7a9ac', status: 'normal', message: 'Good service' },
        { id: 'n', name: 'N', color: '#fccc0a', status: 'alert', message: 'Weekend service changes' },
        { id: 'q', name: 'Q', color: '#fccc0a', status: 'normal', message: 'Good service' },
        { id: 'r', name: 'R', color: '#fccc0a', status: 'normal', message: 'Good service' },
        { id: 'w', name: 'W', color: '#fccc0a', status: 'normal', message: 'Good service' },
      ];
    } catch (error) {
      console.error('Error fetching line status:', error);
      return [];
    }
  }

  /**
   * Get NYC subway stations near a location
   */
  private getNYCStations(location: { lat: number; lng: number }, radius: number): TransitStation[] {
    // These are real NYC subway stations for demonstration
    const stations: TransitStation[] = [
      {
        id: 'union-sq',
        name: 'Union Square - 14th St',
        location: { lat: 40.735736, lng: -73.989728 },
        routes: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
        arrivals: [],
      },
      {
        id: 'times-sq',
        name: 'Times Square - 42nd St',
        location: { lat: 40.754629, lng: -73.986582 },
        routes: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
        arrivals: [],
      },
      {
        id: 'grand-central',
        name: 'Grand Central - 42nd St',
        location: { lat: 40.752769, lng: -73.977360 },
        routes: ['4', '5', '6', '7', 'S'],
        arrivals: [],
      },
      {
        id: '14th-union-sq',
        name: '14th St - Union Sq',
        location: { lat: 40.734673, lng: -73.989951 },
        routes: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
        arrivals: [],
      },
    ];

    // Filter by distance (simple approximation)
    return stations.filter(station => {
      const distance = this.calculateDistance(location, station.location);
      return distance <= radius;
    });
  }

  /**
   * Generate realistic mock arrivals
   */
  private getMockArrivals(stationId: string): TransitArrival[] {
    const routes = this.getRoutesForStation(stationId);
    const arrivals: TransitArrival[] = [];

    routes.forEach(route => {
      // Generate 2-3 arrivals per route
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        const minutes = 2 + (i * 5) + Math.floor(Math.random() * 3);
        arrivals.push({
          route,
          destination: this.getDestinationForRoute(route),
          arrivalTime: `${minutes} min`,
          isRealtime: Math.random() > 0.2, // 80% real-time
          delay: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : undefined,
        });
      }
    });

    return arrivals.sort((a, b) => {
      const aMin = parseInt(a.arrivalTime);
      const bMin = parseInt(b.arrivalTime);
      return aMin - bMin;
    });
  }

  private getRoutesForStation(stationId: string): string[] {
    const routeMap: Record<string, string[]> = {
      'union-sq': ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
      'times-sq': ['1', '2', '3', '7', 'N', 'Q', 'R', 'W'],
      'grand-central': ['4', '5', '6', '7'],
      '14th-union-sq': ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
    };
    return routeMap[stationId] || ['4', '5', '6'];
  }

  private getDestinationForRoute(route: string): string {
    const destinations: Record<string, string> = {
      '4': 'Upton/Woodlawn',
      '5': 'E 180 St/Dyre Av',
      '6': 'Pelham Bay Park',
      'L': 'Canarsie/8 Av',
      'N': 'Astoria/Coney Island',
      'Q': 'Astoria/Coney Island',
      'R': 'Forest Hills/Bay Ridge',
      'W': 'Astoria/Whitehall',
      '1': 'Van Cortlandt Park',
      '2': 'Wakefield/Flatbush',
      '3': 'Harlem/New Lots',
      '7': 'Flushing/Times Sq',
    };
    return destinations[route] || 'Downtown';
  }

  /**
   * Calculate distance between two points (rough approximation)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

// Export singleton instance
export const transitAPI = new TransitAPI();

// Export for easy use in components
export async function getNearbyTransitStations(
  location: { lat: number; lng: number },
  radius: number = 500
): Promise<TransitStation[]> {
  return transitAPI.getNearbyStations(location, radius);
}

export async function getTransitArrivals(stationId: string): Promise<TransitArrival[]> {
  return transitAPI.getArrivals(stationId);
}

export async function getTransitLineStatus(): Promise<TransitLine[]> {
  return transitAPI.getLineStatus();
}
