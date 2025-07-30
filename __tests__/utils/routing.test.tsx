// __tests__/utils/routing.test.tsx - Routing utility tests
import { fetchRoute, TravelMode, RouteResult } from '@/utils/api';
import { TEST_CONFIG } from '../config/testSetup';

// Mock data for consistent testing
const MOCK_LOCATIONS = {
  start: [0, 0] as [number, number],
  end: [1, 1] as [number, number],
  invalidStart: [999, 999] as [number, number],
  invalidEnd: [-999, -999] as [number, number],
};

const MOCK_ROUTE_RESPONSES = {
  walking: {
    status: 'OK',
    routes: [
      {
        legs: [
          {
            distance: { value: 1000 },
            duration: { value: 600 }, // 10 minutes
            steps: [
              {
                html_instructions: 'Walk to <b>destination</b>',
                distance: { value: 500 },
                duration: { value: 300 },
                start_location: { lat: 0, lng: 0 },
                end_location: { lat: 0.5, lng: 0.5 },
                travel_mode: 'WALKING',
              },
              {
                html_instructions: 'Continue walking to <b>final destination</b>',
                distance: { value: 500 },
                duration: { value: 300 },
                start_location: { lat: 0.5, lng: 0.5 },
                end_location: { lat: 1, lng: 1 },
                travel_mode: 'WALKING',
              },
            ],
          },
        ],
        overview_polyline: { points: 'walking_polyline_123' },
        bounds: {
          northeast: { lat: 1, lng: 1 },
          southwest: { lat: 0, lng: 0 },
        },
      },
    ],
  },
  bicycling: {
    status: 'OK',
    routes: [
      {
        legs: [
          {
            distance: { value: 1200 },
            duration: { value: 400 }, // 6.67 minutes
            steps: [
              {
                html_instructions: 'Bike to <b>destination</b>',
                distance: { value: 1200 },
                duration: { value: 400 },
                start_location: { lat: 0, lng: 0 },
                end_location: { lat: 1, lng: 1 },
                travel_mode: 'BICYCLING',
              },
            ],
          },
        ],
        overview_polyline: { points: 'cycling_polyline_789' },
        bounds: {
          northeast: { lat: 1, lng: 1 },
          southwest: { lat: 0, lng: 0 },
        },
      },
    ],
  },
  transit: {
    status: 'OK',
    routes: [
      {
        legs: [
          {
            distance: { value: 800 },
            duration: { value: 900 }, // 15 minutes (includes waiting)
            steps: [
              {
                html_instructions: 'Walk to <b>Bus Stop A</b>',
                distance: { value: 200 },
                duration: { value: 180 },
                start_location: { lat: 0, lng: 0 },
                end_location: { lat: 0.2, lng: 0.2 },
                travel_mode: 'WALKING',
              },
              {
                html_instructions: 'Take <b>Bus Route 42</b>',
                distance: { value: 400 },
                duration: { value: 540 },
                start_location: { lat: 0.2, lng: 0.2 },
                end_location: { lat: 0.8, lng: 0.8 },
                travel_mode: 'TRANSIT',
              },
              {
                html_instructions: 'Walk to <b>destination</b>',
                distance: { value: 200 },
                duration: { value: 180 },
                start_location: { lat: 0.8, lng: 0.8 },
                end_location: { lat: 1, lng: 1 },
                travel_mode: 'WALKING',
              },
            ],
          },
        ],
        overview_polyline: { points: 'transit_polyline_456' },
        bounds: {
          northeast: { lat: 1, lng: 1 },
          southwest: { lat: 0, lng: 0 },
        },
      },
    ],
  },
  empty: {
    status: 'OK',
    routes: [],
  },
  zeroResults: {
    status: 'ZERO_RESULTS',
    routes: [],
  },
  notFound: {
    status: 'NOT_FOUND',
    error_message: 'Location not found',
  },
};

describe('Routing and Navigation Utils', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    
    // Setup default fetch mock
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_ROUTE_RESPONSES.walking),
      } as Response)
    );
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe('Route Fetching - Different Travel Modes', () => {
    it('should fetch route for walking mode correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.walking,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(route).toBeDefined();
      expect(route?.mode).toBe('walking');
      expect(route?.totalDistance).toBe(1000);
      expect(route?.totalDuration).toBe(600);
      expect(route?.steps).toHaveLength(2);
      expect(route?.overview_polyline).toBe('walking_polyline_123');
      
      // Verify step details
      expect(route?.steps[0].instruction).toBe('Walk to destination');
      expect(route?.steps[0].travelMode).toBe('walking');
      expect(route?.steps[0].distance).toBe(500);
      expect(route?.steps[0].duration).toBe(300);
    });

    it('should fetch route for bicycling mode correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.bicycling,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'bicycling');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(route).toBeDefined();
      expect(route?.mode).toBe('bicycling');
      expect(route?.totalDistance).toBe(1200);
      expect(route?.totalDuration).toBe(400);
      expect(route?.steps).toHaveLength(1);
      expect(route?.overview_polyline).toBe('cycling_polyline_789');
    });

    it('should fetch route for transit mode correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.transit,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'transit');

      expect(route).toBeDefined();
      expect(route?.mode).toBe('transit');
      expect(route?.totalDistance).toBe(800);
      expect(route?.totalDuration).toBe(900);
      expect(route?.steps).toHaveLength(3);
      
      // Verify mixed transport modes in transit
      expect(route?.steps[0].travelMode).toBe('walking');
      expect(route?.steps[1].travelMode).toBe('transit');
      expect(route?.steps[2].travelMode).toBe('walking');
    });

    it('should handle driving mode if supported', async () => {
      const drivingResponse = {
        ...MOCK_ROUTE_RESPONSES.bicycling,
        routes: [{
          ...MOCK_ROUTE_RESPONSES.bicycling.routes[0],
          legs: [{
            ...MOCK_ROUTE_RESPONSES.bicycling.routes[0].legs[0],
            duration: { value: 300 }, // Faster by car
            steps: [{
              ...MOCK_ROUTE_RESPONSES.bicycling.routes[0].legs[0].steps[0],
              travel_mode: 'DRIVING',
            }],
          }],
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => drivingResponse,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'driving' as TravelMode);
      
      if (route) {
        expect(route.totalDuration).toBe(300);
        expect(route.steps[0].travelMode).toBe('driving');
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty route responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.empty,
      } as Response);

      await expect(
        fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking')
      ).rejects.toThrow();
    });

    it('should handle ZERO_RESULTS status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.zeroResults,
      } as Response);

      await expect(
        fetchRoute(MOCK_LOCATIONS.invalidStart, MOCK_LOCATIONS.invalidEnd, 'walking')
      ).rejects.toThrow();
    });

    it('should handle API error statuses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.notFound,
      } as Response);

      await expect(
        fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking')
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(
        fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking')
      ).rejects.toThrow('Network connection failed');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(
        fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking')
      ).rejects.toThrow();
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      await expect(
        fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking')
      ).rejects.toThrow();
    });

    it('should handle timeout scenarios', async () => {
      jest.setTimeout(TEST_CONFIG.timeouts.slow);
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => MOCK_ROUTE_RESPONSES.walking,
          } as Response), TEST_CONFIG.timeouts.medium);
        })
      );

      // This should complete within the timeout
      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');
      expect(route).toBeDefined();
    });
  });

  describe('Route Data Validation', () => {
    it('should correctly parse HTML instructions', async () => {
      const instructionResponse = {
        ...MOCK_ROUTE_RESPONSES.walking,
        routes: [{
          ...MOCK_ROUTE_RESPONSES.walking.routes[0],
          legs: [{
            ...MOCK_ROUTE_RESPONSES.walking.routes[0].legs[0],
            steps: [{
              html_instructions: 'Turn <b>left</b> onto <b>Main Street</b>, then continue for <b>200m</b>',
              distance: { value: 1000 },
              duration: { value: 600 },
              start_location: { lat: 0, lng: 0 },
              end_location: { lat: 1, lng: 1 },
              travel_mode: 'WALKING',
            }],
          }],
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => instructionResponse,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');
      
      expect(route?.steps[0].instruction).toBe('Turn left onto Main Street, then continue for 200m');
    });

    it('should handle routes with multiple legs', async () => {
      const multiLegResponse = {
        status: 'OK',
        routes: [{
          legs: [
            {
              distance: { value: 500 },
              duration: { value: 300 },
              steps: [{
                html_instructions: 'Walk to waypoint',
                distance: { value: 500 },
                duration: { value: 300 },
                start_location: { lat: 0, lng: 0 },
                end_location: { lat: 0.5, lng: 0.5 },
                travel_mode: 'WALKING',
              }],
            },
            {
              distance: { value: 500 },
              duration: { value: 300 },
              steps: [{
                html_instructions: 'Walk to destination',
                distance: { value: 500 },
                duration: { value: 300 },
                start_location: { lat: 0.5, lng: 0.5 },
                end_location: { lat: 1, lng: 1 },
                travel_mode: 'WALKING',
              }],
            },
          ],
          overview_polyline: { points: 'multi_leg_polyline' },
          bounds: {
            northeast: { lat: 1, lng: 1 },
            southwest: { lat: 0, lng: 0 },
          },
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => multiLegResponse,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');
      
      expect(route?.totalDistance).toBe(1000);
      expect(route?.totalDuration).toBe(600);
      expect(route?.steps).toHaveLength(2);
    });

    it('should validate coordinate bounds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.walking,
      } as Response);

      const route = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');

      expect(route?.bounds).toBeDefined();
      expect(route?.bounds.northeast.lat).toBeGreaterThanOrEqual(route?.bounds.southwest.lat!);
      expect(route?.bounds.northeast.lng).toBeGreaterThanOrEqual(route?.bounds.southwest.lng!);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.walking,
      } as Response);

      const promises = Array.from({ length: 5 }, (_, i) => 
        fetchRoute([i, i], [i + 1, i + 1], 'walking')
      );

      const routes = await Promise.all(promises);
      
      expect(routes).toHaveLength(5);
      routes.forEach(route => {
        expect(route).toBeDefined();
        expect(route?.mode).toBe('walking');
      });
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid sequential requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.walking,
      } as Response);

      const startTime = Date.now();
      
      for (let i = 0; i < 3; i++) {
        const route = await fetchRoute([i, i], [i + 1, i + 1], 'walking');
        expect(route).toBeDefined();
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(TEST_CONFIG.timeouts.medium);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should maintain data consistency across requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => MOCK_ROUTE_RESPONSES.walking,
      } as Response);

      const route1 = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');
      const route2 = await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');

      expect(route1).toEqual(route2);
    });
  });

  describe('API Integration', () => {
    it('should format request URL correctly', async () => {
      await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'walking');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('origin=0,0'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('destination=1,1'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('mode=walking'),
      );
    });

    it('should include required API parameters', async () => {
      await fetchRoute(MOCK_LOCATIONS.start, MOCK_LOCATIONS.end, 'transit');

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('key=');
      expect(fetchUrl).toContain('mode=transit');
    });

    it('should handle special characters in coordinates', async () => {
      const specialCoords: [number, number] = [37.7749, -122.4194]; // San Francisco
      
      await fetchRoute(specialCoords, MOCK_LOCATIONS.end, 'walking');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('37.7749,-122.4194'),
      );
    });
  });
});
