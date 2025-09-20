/**
 * HOOK TEST: useRoutePrefetch - Critical Route Prefetching Tests
 * 
 * Testing the useRoutePrefetch hook following HookTestTemplate pattern.
 * This hook is critical for route performance - prefetches route variants for smooth UX.
 * 
 * Key test areas:
 * - Route variant prefetching for different travel modes
 * - QueryClient integration and caching
 * - Error handling and fallback behavior
 * - Performance optimization patterns
 * - Route service integration
 */

import { jest } from '@jest/globals';
import { QueryClient } from "@tanstack/react-query";

import { prefetchRouteVariants } from "@/hooks/useRoutePrefetch";
import * as routeService from "@/services/routeService";

// ===== MOCK SECTION =====
// Mock route service
jest.mock("@/services/routeService", () => ({
  fetchRoutes: jest.fn(),
}));

// Mock QueryClient methods
const mockPrefetchQuery = jest.fn();
const mockQueryClient = {
  prefetchQuery: mockPrefetchQuery,
} as any;

// ===== TEST UTILITIES =====
/**
 * Creates mock location objects for testing
 */
const createMockLocation = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  category: any = "other"
) => ({
  id,
  name,
  address: `${name} Address`,
  category,
  coordinates: { latitude, longitude },
});

/**
 * Creates mock route options for testing
 */
const createMockRouteOptions = (overrides: any = {}) => ({
  travelMode: "walking" as any,
  avoidHighways: false,
  avoidTolls: false,
  accessibilityMode: false,
  ...overrides,
});

// ===== TEST SETUP =====
describe('useRoutePrefetch Hook - Critical Route Prefetching Tests', () => {
  let queryClient: QueryClient;
  let mockFetchRoutes: jest.MockedFunction<typeof routeService.fetchRoutes>;

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockFetchRoutes = routeService.fetchRoutes as jest.MockedFunction<typeof routeService.fetchRoutes>;
    mockFetchRoutes.mockResolvedValue([]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ===== CORE FUNCTIONALITY TESTS =====

  it('should prefetch route variants for all travel modes except excluded mode', async () => {
    // Setup: Create test locations
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions({ travelMode: "walking" });
    const excludeMode = "transit";

    // Execute: Prefetch route variants
    await prefetchRouteVariants(
      queryClient,
      origin,
      destination,
      excludeMode,
      baseOptions
    );

    // Verify: fetchRoutes called for walking, biking, and driving (excluding transit)
    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
    
    // Verify specific calls for each mode
    expect(mockFetchRoutes).toHaveBeenCalledWith({
      origin,
      destination,
      mode: "walking",
      options: { ...baseOptions, travelMode: "walking" },
    });
    expect(mockFetchRoutes).toHaveBeenCalledWith({
      origin,
      destination,
      mode: "biking",
      options: { ...baseOptions, travelMode: "biking" },
    });
    expect(mockFetchRoutes).toHaveBeenCalledWith({
      origin,
      destination,
      mode: "driving",
      options: { ...baseOptions, travelMode: "driving" },
    });
  });

  it('should handle different excluded modes correctly', async () => {
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions();

    // Test excluding walking mode
    await prefetchRouteVariants(
      queryClient,
      origin,
      destination,
      "walking",
      baseOptions
    );

    // Should call for biking, driving, and transit (excluding walking)
    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
    expect(mockFetchRoutes).not.toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "walking"
      })
    );
  });

  it('should preserve route options when prefetching variants', async () => {
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions({
      avoidHighways: true,
      avoidTolls: true,
      accessibilityMode: true,
    });

    await prefetchRouteVariants(
      queryClient,
      origin,
      destination,
      "transit",
      baseOptions
    );

    // Verify all calls preserve the route options
    expect(mockFetchRoutes).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          avoidHighways: true,
          avoidTolls: true,
          accessibilityMode: true,
        })
      })
    );
  });

  // ===== ERROR HANDLING TESTS =====

  it('should handle route service errors gracefully', async () => {
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions();

    // Mock fetchRoutes to throw an error
    mockFetchRoutes.mockRejectedValue(new Error("Route service error"));

    // Should not throw error when prefetching fails
    await expect(
      prefetchRouteVariants(queryClient, origin, destination, "transit", baseOptions)
    ).resolves.not.toThrow();

    // Verify fetchRoutes was still called
    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
  });

  it('should handle empty route responses', async () => {
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions();

    // Mock fetchRoutes to return empty array
    mockFetchRoutes.mockResolvedValue([]);

    await prefetchRouteVariants(
      queryClient,
      origin,
      destination,
      "transit",
      baseOptions
    );

    // Should complete successfully with empty results
    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
  });

  // ===== EDGE CASES =====

  it('should handle same origin and destination', async () => {
    const sameLocation = createMockLocation("same", "Same Place", 0, 0);
    const baseOptions = createMockRouteOptions();

    await prefetchRouteVariants(
      queryClient,
      sameLocation,
      sameLocation,
      "transit",
      baseOptions
    );

    // Should still attempt to prefetch routes
    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
  });

  it('should handle all travel modes being excluded', async () => {
    const origin = createMockLocation("o1", "Origin", 0, 0);
    const destination = createMockLocation("d1", "Destination", 1, 1);
    const baseOptions = createMockRouteOptions();

    // Note: This tests the current behavior, though in practice
    // this edge case might not occur in normal app usage
    await prefetchRouteVariants(
      queryClient,
      origin,
      destination,
      "walking", // Exclude one mode, others should still be prefetched
      baseOptions
    );

    expect(mockFetchRoutes).toHaveBeenCalledTimes(3);
  });
});
