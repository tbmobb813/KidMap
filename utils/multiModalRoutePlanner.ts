// utils/multiModalRoutePlanner.ts - Advanced multi-modal routing for KidMap
import { TravelMode, fetchRoute, RouteResult } from './api'
import {
  getNearbyTransitStations,
  TransitStation,
  getTransitDirections,
} from './transitApi'
import { RouteOption, RouteStep } from './routePlanner'

export interface MultiModalRouteOptions {
  maxWalkingDistance: number // meters
  preferredModes: TravelMode[]
  avoidStairs: boolean
  childAge: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  weatherCondition: 'sunny' | 'rainy' | 'cloudy'
  parentSupervision: boolean
}

export interface CombinedRouteSegment {
  mode: TravelMode
  startPoint: [number, number]
  endPoint: [number, number]
  duration: number // minutes
  distance: number // meters
  steps: RouteStep[]
  transitInfo?: {
    line: string
    color: string
    stops: string[]
    frequency: number // minutes between services
  }
  safetyNotes: string[]
  kidFriendlyTips: string[]
}

export class MultiModalRoutePlanner {
  /**
   * Get comprehensive multi-modal route options
   */
  static async getMultiModalRoutes(
    from: [number, number],
    to: [number, number],
    options: Partial<MultiModalRouteOptions> = {},
  ): Promise<RouteOption[]> {
    const settings: MultiModalRouteOptions = {
      maxWalkingDistance: 800, // 800m default
      preferredModes: ['walking', 'transit'],
      avoidStairs: false,
      childAge: 10,
      timeOfDay: 'afternoon',
      weatherCondition: 'sunny',
      parentSupervision: true,
      ...options,
    }

    try {
      const routes: RouteOption[] = []

      // Get all basic routes
      const basicRoutes = await Promise.all([
        this.getPureWalkingRoute(from, to, settings),
        this.getPureBikingRoute(from, to, settings),
        this.getPureTransitRoute(from, to, settings),
        this.getCombinedWalkTransitRoute(from, to, settings),
        this.getCombinedBikeTransitRoute(from, to, settings),
        this.getOptimalMixedRoute(from, to, settings),
      ])

      // Filter out null results
      basicRoutes.forEach((route) => {
        if (route) routes.push(route)
      })

      // Sort by recommendation score
      return routes.sort((a, b) => {
        const scoreA = this.calculateRouteScore(a, settings)
        const scoreB = this.calculateRouteScore(b, settings)
        return scoreB - scoreA
      })
    } catch (error) {
      console.error('Error getting multi-modal routes:', error)
      return []
    }
  }

  /**
   * Pure walking route with kid-friendly optimizations
   */
  private static async getPureWalkingRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    try {
      const route = await fetchRoute(from, to, 'walking')
      if (!route) return null

      const steps: RouteStep[] = route.steps.map((step, index) => ({
        id: `walk-${index}`,
        type: 'walk',
        instruction: this.makeInstructionKidFriendly(
          step.instruction,
          'walking',
        ),
        duration: Math.ceil(step.duration / 60),
        distance: step.distance,
        accessibilityNote: settings.avoidStairs
          ? 'Flat route selected'
          : undefined,
      }))

      // Add kid-friendly waypoints and safety tips
      const enhancedSteps = this.addSafetyStops(steps, 'walking', settings)

      return {
        id: 'pure-walking',
        mode: 'walking',
        duration: Math.ceil(route.totalDuration / 60),
        distance: route.totalDistance,
        steps: enhancedSteps,
        accessibility: settings.avoidStairs ? 'high' : 'medium',
        kidFriendliness: this.calculateKidFriendliness('walking', settings),
        safety: this.calculateSafetyScore('walking', settings),
        route,
      }
    } catch (error) {
      console.error('Error getting walking route:', error)
      return null
    }
  }

  /**
   * Pure biking route with safety considerations
   */
  private static async getPureBikingRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    // Only recommend biking for appropriate ages
    if (settings.childAge < 8) return null

    try {
      const route = await fetchRoute(from, to, 'bicycling')
      if (!route) return null

      const steps: RouteStep[] = route.steps.map((step, index) => ({
        id: `bike-${index}`,
        type: 'walk', // Using walk type but will be interpreted as biking
        instruction: this.makeInstructionKidFriendly(
          step.instruction,
          'bicycling',
        ),
        duration: Math.ceil(step.duration / 60),
        distance: step.distance,
        accessibilityNote: 'Bike lane preferred route',
      }))

      // Add biking safety stops
      const enhancedSteps = this.addSafetyStops(steps, 'bicycling', settings)

      return {
        id: 'pure-biking',
        mode: 'bicycling',
        duration: Math.ceil(route.totalDuration / 60),
        distance: route.totalDistance,
        steps: enhancedSteps,
        accessibility: 'medium',
        kidFriendliness: this.calculateKidFriendliness('bicycling', settings),
        safety: this.calculateSafetyScore('bicycling', settings),
        route,
      }
    } catch (error) {
      console.error('Error getting biking route:', error)
      return null
    }
  }

  /**
   * Pure transit route with supervision considerations
   */
  private static async getPureTransitRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    // Only recommend transit for appropriate ages or with supervision
    if (settings.childAge < 10 && !settings.parentSupervision) return null

    try {
      const route = await fetchRoute(from, to, 'transit')
      if (!route) return null

      const steps: RouteStep[] = route.steps.map((step, index) => {
        const isTransitStep = step.travelMode === 'TRANSIT'

        return {
          id: `transit-${index}`,
          type: isTransitStep ? 'transit' : 'walk',
          instruction: this.makeInstructionKidFriendly(
            step.instruction,
            'transit',
          ),
          duration: Math.ceil(step.duration / 60),
          distance: step.distance,
          transitLine:
            step.transitDetails?.line?.name || step.transitDetails?.line,
          transitColor: step.transitDetails?.line?.color || '#000000',
          accessibilityNote: isTransitStep
            ? 'Stay with adult on transit'
            : undefined,
        }
      })

      // Add transit safety guidelines
      const enhancedSteps = this.addTransitSafetySteps(steps, settings)

      return {
        id: 'pure-transit',
        mode: 'transit',
        duration: Math.ceil(route.totalDuration / 60),
        distance: route.totalDistance,
        steps: enhancedSteps,
        accessibility: 'medium',
        kidFriendliness: this.calculateKidFriendliness('transit', settings),
        safety: this.calculateSafetyScore('transit', settings),
        route,
      }
    } catch (error) {
      console.error('Error getting transit route:', error)
      return null
    }
  }

  /**
   * Combined walk + transit route
   */
  private static async getCombinedWalkTransitRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    try {
      // Find nearby transit stations
      const startStations = await getNearbyTransitStations(
        { lat: from[0], lng: from[1] },
        settings.maxWalkingDistance,
      )

      const endStations = await getNearbyTransitStations(
        { lat: to[0], lng: to[1] },
        settings.maxWalkingDistance,
      )

      if (startStations.length === 0 || endStations.length === 0) {
        return null
      }

      // Find best station combination
      let bestRoute: CombinedRouteSegment[] | null = null
      let bestDuration = Infinity

      for (const startStation of startStations.slice(0, 3)) {
        // Limit to top 3
        for (const endStation of endStations.slice(0, 3)) {
          const segments = await this.calculateCombinedRoute(
            from,
            to,
            startStation,
            endStation,
            settings,
          )

          if (segments) {
            const totalDuration = segments.reduce(
              (sum, seg) => sum + seg.duration,
              0,
            )
            if (totalDuration < bestDuration) {
              bestDuration = totalDuration
              bestRoute = segments
            }
          }
        }
      }

      if (!bestRoute) return null

      // Convert segments to steps
      const steps: RouteStep[] = []
      let stepId = 0

      bestRoute.forEach((segment) => {
        segment.steps.forEach((step) => {
          steps.push({
            ...step,
            id: `combined-${stepId++}`,
          })
        })
      })

      const totalDistance = bestRoute.reduce(
        (sum, seg) => sum + seg.distance,
        0,
      )

      return {
        id: 'walk-transit',
        mode: 'transit',
        duration: bestDuration,
        distance: totalDistance,
        steps,
        accessibility: 'medium',
        kidFriendliness: this.calculateKidFriendliness('combined', settings),
        safety: this.calculateSafetyScore('combined', settings),
      }
    } catch (error) {
      console.error('Error getting combined walk-transit route:', error)
      return null
    }
  }

  /**
   * Combined bike + transit route
   */
  private static async getCombinedBikeTransitRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    // Only for older kids with supervision
    if (settings.childAge < 12 && !settings.parentSupervision) return null

    // Similar to walk-transit but with biking segments
    // Implementation would be similar to getCombinedWalkTransitRoute
    // but using biking for the first/last mile segments
    return null // Placeholder for now
  }

  /**
   * Optimal mixed route that chooses best combination
   */
  private static async getOptimalMixedRoute(
    from: [number, number],
    to: [number, number],
    settings: MultiModalRouteOptions,
  ): Promise<RouteOption | null> {
    // This would analyze all possible combinations and choose the best
    // based on weather, time of day, child age, etc.
    return null // Placeholder for now
  }

  /**
   * Calculate route recommendation score
   */
  private static calculateRouteScore(
    route: RouteOption,
    settings: MultiModalRouteOptions,
  ): number {
    let score = 0

    // Base scores
    score += route.safety * 20 // Safety is most important
    score += route.kidFriendliness * 15

    // Time efficiency (shorter is better, but not too much weight)
    const timeScore = Math.max(0, 60 - route.duration) / 6
    score += timeScore

    // Weather adjustments
    if (settings.weatherCondition === 'rainy') {
      if (route.mode === 'transit') score += 10 // Indoor transport preferred
      if (route.mode === 'walking' || route.mode === 'bicycling') score -= 15
    }

    // Age appropriateness
    const ageBonus = this.getAgeAppropriatenessBonus(
      route.mode,
      settings.childAge,
    )
    score += ageBonus

    // Supervision adjustments
    if (!settings.parentSupervision) {
      if (route.mode === 'walking') score += 10 // Walking is more independent
      if (route.mode === 'transit') score -= 20 // Transit needs supervision
    }

    return Math.max(0, score)
  }

  /**
   * Make instruction kid-friendly
   */
  private static makeInstructionKidFriendly(
    instruction: string,
    mode: TravelMode,
  ): string {
    let friendly = instruction

    // Replace technical terms
    const replacements: Record<string, string> = {
      Head: 'Walk',
      Proceed: 'Go',
      Continue: 'Keep going',
      'Turn right': 'Turn to your right',
      'Turn left': 'Turn to your left',
      'Take the': mode === 'transit' ? 'Get on the' : 'Take the',
      Destination: 'You made it',
      meters: 'steps',
      km: 'blocks',
    }

    Object.entries(replacements).forEach(([old, fresh]) => {
      friendly = friendly.replace(new RegExp(old, 'gi'), fresh)
    })

    // Add encouragement for longer segments
    if (instruction.includes('Continue') || instruction.includes('Head')) {
      const encouragements = [
        "You're doing great! ",
        'Keep it up! ',
        'Almost there! ',
      ]
      friendly =
        encouragements[Math.floor(Math.random() * encouragements.length)] +
        friendly
    }

    return friendly
  }

  /**
   * Add safety stops and tips to route steps
   */
  private static addSafetyStops(
    steps: RouteStep[],
    mode: TravelMode,
    settings: MultiModalRouteOptions,
  ): RouteStep[] {
    const enhanced = [...steps]

    // Add safety reminders every 10 minutes for walking/biking
    if (mode === 'walking' || mode === 'bicycling') {
      let cumulativeDuration = 0
      const safetyInterval = 10 // minutes

      enhanced.forEach((step, index) => {
        cumulativeDuration += step.duration

        if (
          cumulativeDuration >= safetyInterval &&
          index < enhanced.length - 1
        ) {
          const safetyTips = this.getSafetyTips(mode, settings)
          step.accessibilityNote =
            (step.accessibilityNote || '') + ' ' + safetyTips
          cumulativeDuration = 0
        }
      })
    }

    return enhanced
  }

  /**
   * Add transit-specific safety steps
   */
  private static addTransitSafetySteps(
    steps: RouteStep[],
    settings: MultiModalRouteOptions,
  ): RouteStep[] {
    const enhanced = [...steps]

    // Add transit safety reminders
    enhanced.forEach((step) => {
      if (step.type === 'transit') {
        const transitTips = [
          'Stay close to your adult',
          'Hold on tight when the vehicle moves',
          'Wait for others to exit before getting on',
          'Keep your belongings secure',
        ]

        step.accessibilityNote =
          transitTips[Math.floor(Math.random() * transitTips.length)]
      }
    })

    return enhanced
  }

  /**
   * Calculate mode-specific kid-friendliness
   */
  private static calculateKidFriendliness(
    mode: TravelMode | 'combined',
    settings: MultiModalRouteOptions,
  ): number {
    const baseScores: Record<TravelMode | 'combined', number> = {
      walking: 5,
      bicycling: 4,
      transit: 3,
      combined: 3,
      driving: 2,
    }

    let score = baseScores[mode] || 3

    // Age adjustments
    if (mode === 'bicycling' && settings.childAge < 8) score -= 2
    if (mode === 'transit' && settings.childAge < 10) score -= 1
    if (mode === 'combined' && settings.childAge < 12) score -= 1

    // Weather adjustments
    if (settings.weatherCondition === 'rainy') {
      if (mode === 'walking' || mode === 'bicycling') score -= 2
      if (mode === 'transit') score += 1
    }

    return Math.max(1, Math.min(5, score))
  }

  /**
   * Calculate mode-specific safety score
   */
  private static calculateSafetyScore(
    mode: TravelMode | 'combined',
    settings: MultiModalRouteOptions,
  ): number {
    const baseScores: Record<TravelMode | 'combined', number> = {
      walking: 4,
      bicycling: 3,
      transit: 3,
      combined: 3,
      driving: 2,
    }

    let score = baseScores[mode] || 3

    // Supervision bonus
    if (settings.parentSupervision) score += 1

    // Time of day adjustments
    if (settings.timeOfDay === 'evening') score -= 1
    if (settings.timeOfDay === 'morning') score += 0.5

    return Math.max(1, Math.min(5, Math.round(score)))
  }

  /**
   * Get age appropriateness bonus
   */
  private static getAgeAppropriatenessBonus(
    mode: TravelMode,
    childAge: number,
  ): number {
    const ageRequirements: Record<TravelMode, number> = {
      walking: 5,
      bicycling: 8,
      transit: 10,
      driving: 16,
    }

    const requiredAge = ageRequirements[mode] || 5
    const ageGap = childAge - requiredAge

    if (ageGap >= 2) return 10 // Well above required age
    if (ageGap >= 0) return 5 // Meets requirements
    if (ageGap >= -2) return -5 // Slightly below
    return -15 // Too young
  }

  /**
   * Get safety tips based on mode and settings
   */
  private static getSafetyTips(
    mode: TravelMode,
    settings: MultiModalRouteOptions,
  ): string {
    const walkingTips = [
      'Look both ways before crossing',
      'Stay on the sidewalk',
      'Be aware of your surroundings',
      'Check in with your adult',
    ]

    const bikingTips = [
      'Wear your helmet',
      'Signal before turning',
      'Watch for car doors',
      'Stay in the bike lane',
    ]

    const tips = mode === 'walking' ? walkingTips : bikingTips
    return tips[Math.floor(Math.random() * tips.length)]
  }

  /**
   * Calculate combined route segments
   */
  private static async calculateCombinedRoute(
    from: [number, number],
    to: [number, number],
    startStation: TransitStation,
    endStation: TransitStation,
    settings: MultiModalRouteOptions,
  ): Promise<CombinedRouteSegment[] | null> {
    try {
      const segments: CombinedRouteSegment[] = []

      // Walking segment to start station
      const walkToStation = await fetchRoute(
        from,
        [startStation.location.lat, startStation.location.lng],
        'walking',
      )
      if (!walkToStation) return null

      segments.push({
        mode: 'walking',
        startPoint: from,
        endPoint: [startStation.location.lat, startStation.location.lng],
        duration: Math.ceil(walkToStation.totalDuration / 60),
        distance: walkToStation.totalDistance,
        steps: walkToStation.steps.map((step, i) => ({
          id: `walk-to-${i}`,
          type: 'walk',
          instruction: this.makeInstructionKidFriendly(
            step.instruction,
            'walking',
          ),
          duration: Math.ceil(step.duration / 60),
          distance: step.distance,
        })),
        safetyNotes: ['Walk safely to the station'],
        kidFriendlyTips: ["You're walking to catch your ride!"],
      })

      // Transit segment
      const transitRoute = await getTransitDirections(startStation, endStation)
      if (transitRoute) {
        segments.push({
          mode: 'transit',
          startPoint: [startStation.location.lat, startStation.location.lng],
          endPoint: [endStation.location.lat, endStation.location.lng],
          duration: transitRoute.duration,
          distance: transitRoute.distance,
          steps: [
            {
              id: 'transit-ride',
              type: 'transit',
              instruction: `Take the ${transitRoute.line} from ${startStation.name} to ${endStation.name}`,
              duration: transitRoute.duration,
              transitLine: transitRoute.line,
              transitColor: transitRoute.color,
            },
          ],
          transitInfo: {
            line: transitRoute.line,
            color: transitRoute.color,
            stops: transitRoute.stops,
            frequency: transitRoute.frequency || 10,
          },
          safetyNotes: [
            'Stay with your adult on transit',
            'Hold the handrails',
          ],
          kidFriendlyTips: ['Enjoy the ride!', 'Look out the window!'],
        })
      }

      // Walking segment from end station
      const walkFromStation = await fetchRoute(
        [endStation.location.lat, endStation.location.lng],
        to,
        'walking',
      )
      if (walkFromStation) {
        segments.push({
          mode: 'walking',
          startPoint: [endStation.location.lat, endStation.location.lng],
          endPoint: to,
          duration: Math.ceil(walkFromStation.totalDuration / 60),
          distance: walkFromStation.totalDistance,
          steps: walkFromStation.steps.map((step, i) => ({
            id: `walk-from-${i}`,
            type: 'walk',
            instruction: this.makeInstructionKidFriendly(
              step.instruction,
              'walking',
            ),
            duration: Math.ceil(step.duration / 60),
            distance: step.distance,
          })),
          safetyNotes: ['Almost there! Walk safely to your destination'],
          kidFriendlyTips: ["You're almost at your destination!"],
        })
      }

      return segments
    } catch (error) {
      console.error('Error calculating combined route:', error)
      return null
    }
  }
}
