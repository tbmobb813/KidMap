// utils/routePlanner.ts - Enhanced route planning for KidMap with multi-modal support
import { fetchRoute, RouteResult, TravelMode } from './api';
import { getNearbyTransitStations, TransitStation, getTransitDirections } from './transitApi';
import { MultiModalRoutePlanner, MultiModalRouteOptions } from './multiModalRoutePlanner';

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
  recommendation?: {
    score: number;
    reasons: string[];
    warnings: string[];
  };
}

export interface RouteStep {
  id: string;
  type: 'walk' | 'transit' | 'wait' | 'bike';
  instruction: string;
  duration: number; // minutes
  distance?: number; // meters
  transitLine?: string;
  transitColor?: string;
  accessibilityNote?: string;
}

/**
 * Enhanced route planner for kid-friendly navigation with multi-modal support
 */
export class RoutePlanner {
  /**
   * Get comprehensive route options using multi-modal planner
   */
  static async getRouteOptions(
    from: [number, number],
    to: [number, number],
    preferences: {
      preferTransit?: boolean;
      avoidStairs?: boolean;
      maxWalkingDistance?: number; // meters
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
      childAge?: number;
      parentSupervision?: boolean;
      weatherCondition?: 'sunny' | 'rainy' | 'cloudy';
      preferredModes?: TravelMode[];
    } = {}
  ): Promise<RouteOption[]> {
    try {
      // Use the new multi-modal route planner for comprehensive options
      const multiModalOptions: Partial<MultiModalRouteOptions> = {
        maxWalkingDistance: preferences.maxWalkingDistance || 800,
        preferredModes: preferences.preferredModes || ['walking', 'transit'],
        avoidStairs: preferences.avoidStairs || false,
        childAge: preferences.childAge || 10,
        timeOfDay: preferences.timeOfDay || 'afternoon',
        weatherCondition: preferences.weatherCondition || 'sunny',
        parentSupervision: preferences.parentSupervision ?? true,
      };

      const routes = await MultiModalRoutePlanner.getMultiModalRoutes(
        from, to, multiModalOptions
      );

      // Add legacy compatibility and enhanced recommendations
      return routes.map(route => ({
        ...route,
        recommendation: this.generateRecommendation(route, preferences)
      }));

    } catch (error) {
      console.error('Error getting multi-modal route options:', error);
      // Fallback to legacy system
      return this.getLegacyRouteOptions(from, to, preferences);
    }
  }

  /**
   * Legacy route options for backwards compatibility
   */
  private static async getLegacyRouteOptions(
    from: [number, number],
    to: [number, number],
    preferences: any
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
      console.error('Error getting legacy route options:', error);
      return [];
    }
  }

  /**
   * Generate recommendation with scoring and reasons
   */
  private static generateRecommendation(
    route: RouteOption,
    preferences: any
  ): RouteOption['recommendation'] {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Safety scoring
    if (route.safety >= 4) {
      score += 20;
      reasons.push('High safety rating');
    } else if (route.safety <= 2) {
      warnings.push('Lower safety rating - consider adult supervision');
      score -= 10;
    }

    // Kid-friendliness scoring
    if (route.kidFriendliness >= 4) {
      score += 15;
      reasons.push('Very kid-friendly route');
    } else if (route.kidFriendliness <= 2) {
      warnings.push('May be challenging for younger children');
      score -= 5;
    }

    // Duration considerations
    if (route.duration <= 15) {
      score += 10;
      reasons.push('Quick journey time');
    } else if (route.duration >= 45) {
      warnings.push('Long journey - bring entertainment');
      score -= 5;
    }

    // Mode-specific recommendations
    switch (route.mode) {
      case 'walking':
        if (preferences.weatherCondition === 'rainy') {
          warnings.push('Walking in rain - bring umbrella');
          score -= 5;
        } else {
          reasons.push('Great exercise and independence');
          score += 5;
        }
        break;
      
      case 'bicycling':
        if ((preferences.childAge || 10) >= 8) {
          reasons.push('Fun and eco-friendly option');
          score += 5;
        } else {
          warnings.push('Biking may be too advanced for this age');
          score -= 15;
        }
        break;
      
      case 'transit':
        if (preferences.parentSupervision) {
          reasons.push('Comfortable with adult guidance');
          score += 10;
        } else if ((preferences.childAge || 10) < 10) {
          warnings.push('Transit requires adult supervision');
          score -= 20;
        }
        break;
    }

    // Accessibility bonus
    if (route.accessibility === 'high') {
      score += 5;
      reasons.push('Excellent accessibility');
    }

    return {
      score: Math.max(0, score),
      reasons,
      warnings
    };
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

  return RoutePlanner.getRouteOptions(from, to, preferences);
}
