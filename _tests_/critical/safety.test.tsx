/**
 * HOOK TEST: useSafeZoneMonitor - Critical Safety Tests
 * 
 * Test// ===== TEST UTILITIES =====neMonitor hook following HookTestTemplate pattern.
 * This hook is critical for child safety - monitors zone entry/exit detection.
 * 
 * Key test areas:
 * - Zone entry/exit event generation
 * - Inside vs outside zone classification
 * - Inactive zone handling
 * - Event history management
 * - Location error handling
 */

import { jest } from '@jest/globals';
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { act } from "react-test-renderer";

import { useSafeZoneMonitor } from "@/src/modules/safety/hooks/useSafeZoneMonitor";

// ===== MOCK SECTION =====
// Mock store state
let mockSafeZones: any[] = [];
let setLocationState: ((loc: any) => void) | null = null;

// Mock SafeZone validation schema
jest.mock("@/core/validation/safetySchemas", () => ({
  SafeZoneSchema: {
    safeParse: jest.fn((input: any) => ({
      success: true,
      data: input,
    })),
  },
}));

// Mock parental store
jest.mock("@/modules/safety/stores/parentalStore", () => ({
  useParentalStore: () => ({
    safeZones: mockSafeZones,
  }),
}));

// Mock location hook with controllable state
jest.mock("@/hooks/useLocation", () => {
  const React = require("react");
  function useLocationMock() {
    const [loc, setLoc] = React.useState({
      latitude: 0,
      longitude: 0,
      error: null,
    });

    React.useEffect(() => {
      setLocationState = setLoc;
    }, []);

    return {
      location: loc,
      hasLocation: !loc.error,
      loading: false,
      safeCoordinates: () =>
        loc.error
          ? undefined
          : { latitude: loc.latitude, longitude: loc.longitude },
    };
  }
  return { __esModule: true, default: useLocationMock };
});

// ===== TEST UTILITIES =====
/**
 * Updates the mock location state for testing
 */
const updateLocation = (
  lat: number,
  lon: number,
  error: string | null = null
) => {
  const newLocation = { latitude: lat, longitude: lon, error } as any;
  act(() => {
    setLocationState?.(newLocation);
  });
};

/**
 * Test harness component to render the hook and capture its return value
 */
// Removed unused TestHarness component.

// ===== TEST SETUP =====
describe('useSafeZoneMonitor Hook - Critical Safety Tests', () => {
  let currentMonitor: ReturnType<typeof useSafeZoneMonitor> | null = null;
  let rerender: any = null;

  /**
   * Renders the hook and captures the monitor instance
   */
  const renderHook = () => {
    const TestComponent = () => {
      const monitor = useSafeZoneMonitor();
      currentMonitor = monitor;
      return null;
    };
    
    const result = render(<TestComponent />);
    rerender = result.rerender;
    return currentMonitor!;
  };

  /**
   * Updates location and triggers re-render to ensure hook sees the new location
   */
  const updateLocationAndRerender = (lat: number, lon: number, error: string | null = null) => {
    updateLocation(lat, lon, error);
    if (rerender) {
      const TestComponent = () => {
        const monitor = useSafeZoneMonitor();
        currentMonitor = monitor;
        return null;
      };
      rerender(<TestComponent />);
    }
  };

  beforeEach(() => {
    // Reset all mock state
    mockSafeZones = [];
    setLocationState = null;
    currentMonitor = null;
    rerender = null;
    updateLocation(0, 0);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // ===== CORE FUNCTIONALITY TESTS =====
  
  it('should generate entry event when entering a safe zone', () => {
    // Setup: Define a safe zone at origin
    mockSafeZones = [
      {
        id: "z1",
        name: "Home",
        latitude: 0,
        longitude: 0,
        radius: 150,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    // Start VERY far outside the zone (about 11km away)
    updateLocationAndRerender(0.1, 0.1); 
    const monitor = renderHook();
    
    // Force refresh to establish initial state (outside)
    act(() => {
      monitor.forceRefresh();
    });
    
    const initialStatus = monitor.getCurrentSafeZoneStatus();
    console.log('Initial status (should be outside):', initialStatus);
    console.log('Initial events:', monitor.events.length);
    
    // Now move inside the zone (at center)
    updateLocationAndRerender(0, 0); 
    act(() => {
      monitor.forceRefresh();
    });
    
    const afterStatus = monitor.getCurrentSafeZoneStatus();
    console.log('After move status (should be inside):', afterStatus);
    console.log('After move events:', monitor.events.length);
    console.log('Events:', monitor.events);
    
    // Verify entry event was generated
    const entries = monitor.events.filter(
      (e) => e.type === "entry" && e.zoneId === "z1"
    );
    expect(entries.length).toBe(1);
  });

  it('should generate exit event when leaving a safe zone', async () => {
    // Setup: Define a safe zone and start outside it
    mockSafeZones = [
      {
        id: "z1",
        name: "Home",
        latitude: 0,
        longitude: 0,
        radius: 150,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    // Start outside the zone
    updateLocation(0.01, 0.01);
    const monitor = renderHook();
    
    // Establish initial state (outside)
    act(() => {
      monitor.forceRefresh();
    });
    
    // Move inside the zone 
    updateLocation(0, 0);
    act(() => {
      monitor.forceRefresh();
    });
    
    // Verify entry event was generated
    await waitFor(() => {
      expect(
        monitor.events.filter((e) => e.type === "entry").length
      ).toBe(1);
    });
    
    // Move outside the zone
    updateLocation(0.002, 0.002);
    act(() => {
      monitor.forceRefresh();
    });
    
    // Verify exit event was generated
    await waitFor(() => {
      const exits = monitor.events.filter(
        (e) => e.type === "exit" && e.zoneId === "z1"
      );
      expect(exits.length).toBe(1);
    });
  });

  it('should correctly classify inside vs outside zones', () => {
    // Setup: Define zones - one at origin (inside) and one far away (outside)
    mockSafeZones = [
      {
        id: "in",
        name: "Inner",
        latitude: 0,
        longitude: 0,
        radius: 200,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
      {
        id: "out",
        name: "Outer",
        latitude: 0.01,
        longitude: 0.01,
        radius: 50,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    // Set location at origin (inside first zone, outside second)
    updateLocation(0, 0);
    const monitor = renderHook();
    
    act(() => {
      monitor.startMonitoring();
      monitor.forceRefresh();
    });
    
    // Verify zone classification
    const status = monitor.getCurrentSafeZoneStatus();
    expect(status).not.toBeNull();
    expect(status!.inside.map((zone: any) => zone.id)).toContain("in");
    expect(status!.inside.map((zone: any) => zone.id)).not.toContain("out");
    expect(status!.outside.map((zone: any) => zone.id)).toContain("out");
    expect(status!.totalActive).toBe(2);
  });

  it('should return outside status when location is unavailable', () => {
    // Setup: Define a safe zone
    mockSafeZones = [
      {
        id: "z1",
        name: "Zone",
        latitude: 0,
        longitude: 0,
        radius: 100,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    const monitor = renderHook();
    
    // Set location with error (permission denied)
    updateLocation(10, 10, "Permission denied");
    act(() => {
      monitor.forceRefresh();
    });
    
    // Verify all zones are marked as outside when location unavailable
    const status = monitor.getCurrentSafeZoneStatus();
    expect(status).not.toBeNull();
    expect(status!.inside.length).toBe(0);
    expect(status!.outside.length).toBe(1);
  });

  it('should cap event history at 20 entries', () => {
    // Setup: Define a safe zone
    mockSafeZones = [
      {
        id: "z1",
        name: "ZoneCap",
        latitude: 0,
        longitude: 0,
        radius: 120,
        isActive: true,
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    // Start outside the zone
    updateLocation(0.01, 0.01);
    const monitor = renderHook();
    
    // Establish initial state (outside)
    act(() => {
      monitor.forceRefresh();
    });
    
    // Simulate multiple entry/exit cycles to exceed history limit
    for (let i = 0; i < 15; i++) {
      // Move inside zone
      updateLocation(0, 0);
      act(() => {
        monitor.forceRefresh();
      });
      
      // Move outside zone
      updateLocation(0.003 + i * 0.0001, 0.003 + i * 0.0001);
      act(() => {
        monitor.forceRefresh();
      });
    }
    
    // Verify event history is capped at 20
    expect(monitor.events.length).toBe(20);
    
    // Verify newest event is at index 0 (most recent first)
    const newest = monitor.events[0];
    expect(newest.type).toBe("exit");
  });

  it('should ignore inactive zones and not generate events', () => {
    // Setup: Define an inactive safe zone
    mockSafeZones = [
      {
        id: "z_inactive",
        name: "Inactive",
        latitude: 0,
        longitude: 0,
        radius: 200,
        isActive: false, // Zone is inactive
        createdAt: Date.now(),
        notifications: { onEntry: true, onExit: true },
      },
    ];
    
    // Set location inside the inactive zone
    updateLocation(0, 0);
    const monitor = renderHook();
    
    act(() => {
      monitor.forceRefresh();
    });
    
    // Verify no events generated for inactive zone
    expect(monitor.events.length).toBe(0);
    
    // Verify zone status reflects no active zones
    const status = monitor.getCurrentSafeZoneStatus();
    expect(status?.inside.length).toBe(0);
    expect(status?.totalActive).toBe(0);
  });
});
