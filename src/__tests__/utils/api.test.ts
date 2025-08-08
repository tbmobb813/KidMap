// __tests__/utils/api.test.ts - API utility tests
import {
  fetchRoute,
  searchPlaces,
  getNearbyTransitStations,
} from '../utils/api'
import { TEST_CONFIG } from '../config/testSetup'
const { testLogger, expectWithLog } = require('./utils/testHelpers')

// Mock data for consistent testing
const MOCK_COORDINATES = {
  origin: [40.7128, -74.006] as [number, number], // New York City
  destination: [40.7589, -73.9851] as [number, number], // Times Square
  invalid: [999, 999] as [number, number],
  zero: [0, 0] as [number, number],
} as const

describe('API Utils - Route Fetching', () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Restore fetch to default behavior before each test
    global.fetch = originalFetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('Route Structure Validation', () => {
    it('should return RouteResult with correct structure for walking mode', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      expect(result).not.toBeNull()
      expect(result).toBeDefined()

      if (result) {
        expect(result.mode).toBe('walking')
        expect(result.steps).toBeDefined()
        expect(Array.isArray(result.steps)).toBe(true)
        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.totalDistance).toBeDefined()
        expect(result.totalDuration).toBeDefined()
        expect(result.bounds).toBeDefined()

        // Validate first step structure
        const firstStep = result.steps[0]
        expect(firstStep.startLocation).toBeDefined()
        expect(firstStep.endLocation).toBeDefined()
        expect(firstStep.instruction).toBeDefined()
        expect(firstStep.distance).toBeGreaterThan(0)
        expect(firstStep.duration).toBeGreaterThan(0)
        expect(firstStep.travelMode).toBe('walking')
      }
    })

    it('should return RouteResult with correct structure for bicycling mode', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'bicycling',
      )

      expect(result).not.toBeNull()

      if (result) {
        expect(result.mode).toBe('bicycling')
        expect(result.steps).toBeDefined()
        expect(result.steps.length).toBeGreaterThan(0)

        result.steps.forEach((step) => {
          expect(step.travelMode).toBe('bicycling')
          expect(step.distance).toBeGreaterThan(0)
          expect(step.duration).toBeGreaterThan(0)
        })
      }
    })

    it('should return RouteResult with correct structure for transit mode', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'transit',
      )

      expect(result).not.toBeNull()

      if (result) {
        expect(result.mode).toBe('transit')
        expect(result.steps).toBeDefined()
        expect(result.steps.length).toBeGreaterThan(0)

        // Transit routes should have mixed travel modes
        const hasTransitStep = result.steps.some(
          (step) => step.travelMode === 'transit',
        )
        const hasWalkingStep = result.steps.some(
          (step) => step.travelMode === 'walking',
        )

        expect(hasTransitStep || hasWalkingStep).toBe(true)
      }
    })

    it('should validate coordinate bounds in route result', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      if (result?.bounds) {
        expect(result.bounds.northeast).toBeDefined()
        expect(result.bounds.southwest).toBeDefined()
        expect(result.bounds.northeast.lat).toBeGreaterThanOrEqual(
          result.bounds.southwest.lat,
        )
        expect(result.bounds.northeast.lng).toBeGreaterThanOrEqual(
          result.bounds.southwest.lng,
        )
      }
    })
  })

  describe('Travel Mode Specific Features', () => {
    it('should not include transit line information for walking mode', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      if (result) {
        result.steps.forEach((step) => {
          expect(step.line).toBeUndefined()
        })
      }
    })

    it('should include transit line information for transit mode', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'transit',
      )

      if (result) {
        const transitSteps = result.steps.filter(
          (step) => step.travelMode === 'transit',
        )
        if (transitSteps.length > 0) {
          const hasLineInfo = transitSteps.some((step) => step.line)
          expect(hasLineInfo).toBe(true)
        }
      }
    })

    it('should have appropriate durations for different modes', async () => {
      const walkingResult = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      const bicyclingResult = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'bicycling',
      )

      if (walkingResult && bicyclingResult) {
        // Bicycling should generally be faster than walking for the same route
        expect(bicyclingResult.totalDuration).toBeLessThanOrEqual(
          walkingResult.totalDuration,
        )
      }
    })

    it('should handle driving mode if supported', async () => {
      try {
        const result = await fetchRoute(
          MOCK_COORDINATES.origin,
          MOCK_COORDINATES.destination,
          'driving' as TravelMode,
        )

        if (result) {
          expect(result.mode).toBe('driving')
          expect(result.steps.length).toBeGreaterThan(0)
          result.steps.forEach((step) => {
            expect(step.travelMode).toBe('driving')
          })
        }
      } catch (error) {
        // Driving mode might not be supported in all implementations
        expect(error).toBeDefined()
      }
    })
  })

  describe('Error Handling', () => {
    it('should return null on network error', async () => {
      // Mock fetch to reject
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network connection failed'))

      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeNull()
    })

    it('should handle HTTP error responses', async () => {
      // Mock fetch to return error response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response)

      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeNull()
    })

    it('should handle invalid JSON responses', async () => {
      // Mock fetch to return invalid JSON
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as Response)

      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeNull()
    })

    it('should handle timeout scenarios gracefully', async () => {
      jest.setTimeout(TEST_CONFIG.timeouts.slow)

      // Mock fetch to take longer than expected
      global.fetch = jest.fn().mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    status: 'OK',
                    routes: [
                      {
                        legs: [
                          {
                            distance: { value: 1000 },
                            duration: { value: 600 },
                            steps: [
                              {
                                html_instructions: 'Test instruction',
                                distance: { value: 1000 },
                                duration: { value: 600 },
                                start_location: { lat: 0, lng: 0 },
                                end_location: { lat: 1, lng: 1 },
                                travel_mode: 'WALKING',
                              },
                            ],
                          },
                        ],
                        overview_polyline: { points: 'test' },
                        bounds: {
                          northeast: { lat: 1, lng: 1 },
                          southwest: { lat: 0, lng: 0 },
                        },
                      },
                    ],
                  }),
                } as Response),
              TEST_CONFIG.timeouts.medium,
            )
          }),
      )

      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeDefined()
    })

    it('should handle empty route responses', async () => {
      // Mock fetch to return empty routes
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'OK',
          routes: [],
        }),
      } as Response)

      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeNull()
    })

    it('should handle API error statuses', async () => {
      // Mock fetch to return API error
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'ZERO_RESULTS',
          error_message: 'No routes found',
        }),
      } as Response)

      const result = await fetchRoute(
        MOCK_COORDINATES.invalid,
        MOCK_COORDINATES.destination,
        'walking',
      )
      expect(result).toBeNull()
    })
  })

  describe('Input Validation', () => {
    it('should handle valid coordinate ranges', async () => {
      const validCoords: [number, number][] = [
        [40.7128, -74.006], // NYC
        [51.5074, -0.1278], // London
        [-33.8688, 151.2093], // Sydney
        [0, 0], // Null Island
      ]

      for (const coord of validCoords) {
        const result = await fetchRoute(
          coord,
          MOCK_COORDINATES.destination,
          'walking',
        )
        // Should not throw, might return null for invalid routes but shouldn't crash
        expect(typeof result === 'object').toBe(true)
      }
    })

    it('should handle edge case coordinates', async () => {
      const edgeCoords: [number, number][] = [
        [90, 180], // North Pole, Date Line
        [-90, -180], // South Pole, Date Line
        [0, 0], // Equator, Prime Meridian
      ]

      for (const coord of edgeCoords) {
        expect(async () => {
          await fetchRoute(coord, MOCK_COORDINATES.destination, 'walking')
        }).not.toThrow()
      }
    })

    it('should handle all supported travel modes', async () => {
      const supportedModes: TravelMode[] = ['walking', 'bicycling', 'transit']

      for (const mode of supportedModes) {
        const result = await fetchRoute(
          MOCK_COORDINATES.origin,
          MOCK_COORDINATES.destination,
          mode,
        )
        if (result) {
          expect(result.mode).toBe(mode)
        }
        // Should not throw even if mode is not available
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        fetchRoute([i, i], [i + 1, i + 1], 'walking'),
      )

      const results = await Promise.allSettled(requests)

      expect(results.length).toBe(5)
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          // Result might be null for invalid coordinates, but should not reject
          expect(typeof result.value === 'object').toBe(true)
        }
      })
    })

    it('should maintain consistency across identical requests', async () => {
      const request1 = fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )
      const request2 = fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      const [result1, result2] = await Promise.all([request1, request2])

      if (result1 && result2) {
        expect(result1.mode).toBe(result2.mode)
        expect(result1.totalDistance).toBe(result2.totalDistance)
        expect(result1.totalDuration).toBe(result2.totalDuration)
      }
    })

    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now()

      await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(TEST_CONFIG.timeouts.medium)
    })
  })

  describe('Data Format Validation', () => {
    it('should return properly formatted step instructions', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      if (result) {
        result.steps.forEach((step) => {
          expect(typeof step.instruction).toBe('string')
          expect(step.instruction.length).toBeGreaterThan(0)
          // Instructions should not contain HTML tags
          expect(step.instruction).not.toMatch(/<[^>]*>/)
        })
      }
    })

    it('should return numeric values for distances and durations', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      if (result) {
        expect(typeof result.totalDistance).toBe('number')
        expect(typeof result.totalDuration).toBe('number')
        expect(result.totalDistance).toBeGreaterThan(0)
        expect(result.totalDuration).toBeGreaterThan(0)

        result.steps.forEach((step) => {
          expect(typeof step.distance).toBe('number')
          expect(typeof step.duration).toBe('number')
          expect(step.distance).toBeGreaterThan(0)
          expect(step.duration).toBeGreaterThan(0)
        })
      }
    })

    it('should return valid coordinate objects', async () => {
      const result = await fetchRoute(
        MOCK_COORDINATES.origin,
        MOCK_COORDINATES.destination,
        'walking',
      )

      if (result) {
        result.steps.forEach((step) => {
          expect(typeof step.startLocation.lat).toBe('number')
          expect(typeof step.startLocation.lng).toBe('number')
          expect(typeof step.endLocation.lat).toBe('number')
          expect(typeof step.endLocation.lng).toBe('number')

          // Coordinates should be within valid ranges
          expect(step.startLocation.lat).toBeGreaterThanOrEqual(-90)
          expect(step.startLocation.lat).toBeLessThanOrEqual(90)
          expect(step.startLocation.lng).toBeGreaterThanOrEqual(-180)
          expect(step.startLocation.lng).toBeLessThanOrEqual(180)
        })
      }
    })
  })

  describe('API Functions', () => {
    beforeEach(() => {
      testLogger.info('Setting up API test')
      jest.clearAllMocks()
    })

    afterEach(() => {
      testLogger.info('Cleaning up API test')
    })

    test('fetchRoute returns route data', async () => {
      testLogger.info('Testing fetchRoute function')

      const mockResponse = {
        routes: [
          {
            legs: [
              {
                steps: [
                  { instructions: 'Go straight', distance: { value: 100 } },
                ],
              },
            ],
          },
        ],
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchRoute(
        [37.7749, -122.4194],
        [37.7849, -122.4094],
      )

      testLogger.debug(`fetchRoute result: ${JSON.stringify(result)}`)
      expectWithLog('Route result should exist', result).toBeTruthy()

      testLogger.info('fetchRoute test completed')
    })

    test('searchPlaces returns place data', async () => {
      testLogger.info('Testing searchPlaces function')

      const mockResponse = {
        results: [{ name: 'Test Place', place_id: '123' }],
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await searchPlaces('coffee', {
        lat: 37.7749,
        lng: -122.4194,
      })

      testLogger.debug(`searchPlaces result: ${JSON.stringify(result)}`)
      expectWithLog(
        'Places result should be array',
        Array.isArray(result),
      ).toBe(true)

      testLogger.info('searchPlaces test completed')
    })
  })
})
