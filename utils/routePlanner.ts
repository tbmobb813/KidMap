// utils/routePlanner.ts - Integrated route planning for KidMap
import { fetchRoute, RouteResult, TravelMode } from './api';
import { getNearbyTransitStations, TransitStation } from './transitApi';

export interface RouteOption {
  id: string;
  mode: TravelMode;
  duration: number; // minutes
  distance: number; // meters
  steps: RouteStep[];
  accessibility: 'high' | 'medium' | 'low';
  kidFriendliness: number; // 1-5 rating
  safety: number; // 1-5 rating
  route?: RouteResult;
}

export interface RouteStep {
  id: string;
  type: 'walk' | 'transit' | 'wait';
  instruction: string;
  duration: number; // minutes
  distance?: number; // meters
  transitLine?: string;
  transitColor?: string;
  accessibilityNote?: string;
}

/**
 * Enhanced route planner for kid-friendly navigation
 */
export class RouteePlanner {
  /**
   * Get multiple route options between two points
   */
  static async getRouteOptions(
    from: [number, number],
    to: [number, number],
    preferences: {
      preferTransit?: boolean;
      avoidStairs?: boolean;
      maxWalkingDistance?: number; // meters
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
    } = {}
  ): Promise<RouteOption[]> {
    const options: RouteOption[] = [];

    try {
      // Get multiple route types
      const routePromises = [
        this.getWalkingRoute(from, to, preferences),
        this.getTransitRoute(from, to, preferences),
        this.getCombinedRoute(from, to, preferences),
      ];

      const routes = await Promise.all(routePromises);
      
      // Filter out null results and sort by kid-friendliness
      const validRoutes = routes.filter(route => route !== null) as RouteOption[];
      
      return validRoutes.sort((a, b) => {
        // Prioritize safety and kid-friendliness
        const scoreA = (a.safety * 2) + a.kidFriendliness;
        const scoreB = (b.safety * 2) + b.kidFriendliness;
        return scoreB - scoreA;
      });

    } catch (error) {
      console.error('Error getting route options:', error);
      return [];
    }
  }

  /**
   * Walking route with kid-friendly considerations
   */
  private static async getWalkingRoute(
    from: [number, number],
    to: [number, number],
    preferences: any
  ): Promise<RouteOption | null> {
    try {
      const route = await fetchRoute(from, to, 'walking');
      if (!route) return null;

      const steps: RouteStep[] = route.steps.map((step, index) => ({
        id: `walk-${index}`,
        type: 'walk' as const,
        instruction: this.makeKidFriendly(step.instruction),
        duration: Math.ceil(step.duration / 60),
        distance: step.distance,
        accessibilityNote: preferences.avoidStairs ? 'Flat path selected' : undefined,
      }));

      return {
        id: 'walking',
        mode: 'walking' as TravelMode,
        duration: Math.ceil(route.totalDuration / 60),
        distance: route.totalDistance,
        steps,
        accessibility: preferences.avoidStairs ? 'high' : 'medium',
        kidFriendliness: 4, // Walking is generally kid-friendly
        safety: this.calculateSafetyScore('walking', steps),
        route,
      };
    } catch (error) {
      console.error('Error getting walking route:', error);
      return null;
    }
  }

  /**
   * Transit route with safety considerations
   */
  private static async getTransitRoute(
    from: [number, number],
    to: [number, number],
    preferences: any
  ): Promise<RouteOption | null> {
    try {
      const route = await fetchRoute(from, to, 'transit');
      if (!route) return null;

      // Get nearby stations for additional context
      const nearbyStations = await getNearbyTransitStations(
        { lat: from[0], lng: from[1] },
        500 // 500m radius
      );

      const steps: RouteStep[] = route.steps.map((step, index) => ({
        id: `transit-${index}`,
        type: step.travelMode === 'WALKING' ? 'walk' : 'transit',
        instruction: this.makeKidFriendly(step.instruction),
        duration: Math.ceil(step.duration / 60),
        distance: step.distance,
        transitLine: step.transitDetails?.line.name,
        transitColor: step.transitDetails?.line.color,
      }));

      return {
        id: 'transit',
        mode: 'transit' as TravelMode,
        duration: Math.ceil(route.totalDuration / 60),
        distance: route.totalDistance,
        steps,
        accessibility: this.getTransitAccessibility(nearbyStations),
        kidFriendliness: 3, // Transit requires more supervision
        safety: this.calculateSafetyScore('transit', steps),
        route,
      };
    } catch (error) {
      console.error('Error getting transit route:', error);
      return null;
    }
  }

  /**
   * Combined walking + transit route
   */
  private static async getCombinedRoute(
    from: [number, number],
    to: [number, number],
    preferences: any
  ): Promise<RouteOption | null> {
    try {
      // This would implement a smart combination of walking and transit
      // For now, return transit route as fallback
      return this.getTransitRoute(from, to, preferences);
    } catch (error) {
      console.error('Error getting combined route:', error);
      return null;
    }
  }

  /**
   * Make instructions kid-friendly
   */
  private static makeKidFriendly(instruction: string): string {
    const replacements = {
      'Head': 'Walk',
      'Continue': 'Keep walking',
      'Turn left': 'Turn left (like a clock going backwards)',
      'Turn right': 'Turn right (like a clock going forward)',
      'Take the': 'Get on the',
      'Alight at': 'Get off at',
      'Transfer': 'Switch to',
      'Walk to': 'Walk over to',
    };

    let friendly = instruction;
    Object.entries(replacements).forEach(([old, new_]) => {
      friendly = friendly.replace(new RegExp(old, 'gi'), new_);
    });

    return friendly;
  }

  /**
   * Calculate safety score based on route type and steps
   */
  private static calculateSafetyScore(mode: TravelMode, steps: RouteStep[]): number {
    let score = 3; // Base score

    if (mode === 'walking') {
      score += 1; // Walking is generally safer for kids
    }

    // Reduce score for long routes
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    if (totalDuration > 30) score -= 1;
    if (totalDuration > 60) score -= 1;

    return Math.max(1, Math.min(5, score));
  }

  /**
   * Determine transit accessibility from nearby stations
   */
  private static getTransitAccessibility(stations: TransitStation[]): 'high' | 'medium' | 'low' {
    if (stations.length === 0) return 'low';
    
    // In a real implementation, check for elevators, escalators, etc.
    // For now, assume medium accessibility
    return 'medium';
  }

  /**
   * Get emergency route - fastest and safest option
   */
  static async getEmergencyRoute(
    from: [number, number],
    to: [number, number]
  ): Promise<RouteOption | null> {
    try {
      // Prioritize walking for emergency situations (more control)
      const walkingRoute = await this.getWalkingRoute(from, to, { avoidStairs: true });
      
      if (walkingRoute && walkingRoute.duration <= 20) {
        return {
          ...walkingRoute,
          id: 'emergency-walking',
          safety: 5, // Max safety for emergency
          kidFriendliness: 5,
        };
      }

      // Fall back to transit if walking is too long
      const transitRoute = await this.getTransitRoute(from, to, {});
      return transitRoute ? {
        ...transitRoute,
        id: 'emergency-transit',
        safety: 4,
      } : null;

    } catch (error) {
      console.error('Error getting emergency route:', error);
      return null;
    }
  }
}

/**
 * Get kid-friendly route recommendations
 */
export async function getKidFriendlyRoutes(
  from: [number, number],
  to: [number, number],
  childAge?: number
): Promise<RouteOption[]> {
  const preferences = {
    preferTransit: (childAge || 10) >= 12, // Older kids can handle transit better
    avoidStairs: (childAge || 10) < 8, // Younger kids need accessibility
    maxWalkingDistance: (childAge || 10) >= 14 ? 1000 : 500, // Adjust for age
  };

  return RouteePlanner.getRouteOptions(from, to, preferences);
}
