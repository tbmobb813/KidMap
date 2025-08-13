import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { act } from 'react-test-renderer';

// --- Mocks (must be declared before importing hook) ---
let mockSafeZones: any[] = [];
let setLocationState: ((loc: any) => void) | null = null;

jest.mock('@/modules/safety/stores/parentalStore', () => ({
  useParentalStore: () => ({
    safeZones: mockSafeZones,
    settings: { safeZoneAlerts: true },
  }),
}));

jest.mock('@/hooks/useLocation', () => {
  const React = require('react');
  function useLocationMock() {
    const [loc, setLoc] = React.useState({ latitude: 0, longitude: 0, error: null });
    React.useEffect(() => { setLocationState = setLoc; }, []);
    return {
      location: loc,
      hasLocation: !loc.error,
      loading: false,
      safeCoordinates: () => (!loc.error ? { latitude: loc.latitude, longitude: loc.longitude } : undefined),
    };
  }
  return { __esModule: true, default: useLocationMock };
});

// Now import the hook after mocks so they take effect
 
import { useSafeZoneMonitor } from '@/modules/safety/hooks/useSafeZoneMonitor';

// Helper to update mock location with re-render
const updateLocation = (lat: number, lon: number, error: string | null = null) => {
  const newLocation = { latitude: lat, longitude: lon, error } as any;
  act(() => { setLocationState?.(newLocation); });
};

const TestHarness: React.FC<{ onUpdate: (m: ReturnType<typeof useSafeZoneMonitor>) => void }> = ({ onUpdate }) => {
  const monitor = useSafeZoneMonitor();
  // Call on every render to always expose latest object reference
  onUpdate(monitor);
  return null;
};

describe('useSafeZoneMonitor', () => {
  beforeEach(() => {
    mockSafeZones = [];
    updateLocation(0, 0); // reset
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  let latestMonitor: ReturnType<typeof useSafeZoneMonitor> | null = null;
  const renderMonitor = () => {
    render(<TestHarness onUpdate={(m) => { latestMonitor = m; }} />);
    if (!latestMonitor) throw new Error('Monitor not ready');
    return latestMonitor;
  };

  it('produces entry event when inside a safe zone on first refresh', () => {
    mockSafeZones = [{
      id: 'z1', name: 'Home', latitude: 0, longitude: 0, radius: 150, isActive: true, createdAt: Date.now(),
      notifications: { onEntry: true, onExit: true },
    }];
    updateLocation(0, 0); // already inside
    renderMonitor();
    act(() => { latestMonitor!.forceRefresh(); });
    const entries = latestMonitor!.events.filter(e => e.type === 'entry' && e.zoneId === 'z1');
    expect(entries.length).toBe(1);
  });

  it('produces exit event when leaving a safe zone', async () => {
    mockSafeZones = [{
      id: 'z1', name: 'Home', latitude: 0, longitude: 0, radius: 150, isActive: true, createdAt: Date.now(),
      notifications: { onEntry: true, onExit: true },
    }];
    updateLocation(0, 0); // start inside
    renderMonitor();
    act(() => { latestMonitor!.forceRefresh(); });
    await waitFor(() => {
      expect(latestMonitor!.events.filter(e => e.type === 'entry').length).toBe(1);
    });
    updateLocation(0.002, 0.002); // move outside
    act(() => { latestMonitor!.forceRefresh(); });
    await waitFor(() => {
      const exits = latestMonitor!.events.filter(e => e.type === 'exit' && e.zoneId === 'z1');
      expect(exits.length).toBe(1);
    });
  });

  it('classifies inside vs outside zones correctly', () => {
    mockSafeZones = [
      { id: 'in', name: 'Inner', latitude: 0, longitude: 0, radius: 200, isActive: true, createdAt: Date.now(), notifications: { onEntry: true, onExit: true } },
      { id: 'out', name: 'Outer', latitude: 0.01, longitude: 0.01, radius: 50, isActive: true, createdAt: Date.now(), notifications: { onEntry: true, onExit: true } },
    ];
    updateLocation(0, 0); // inside first only
    const monitor = renderMonitor();
    act(() => { monitor.startMonitoring(); monitor.forceRefresh(); });
    const status = monitor.getCurrentSafeZoneStatus();
    expect(status).not.toBeNull();
    expect(status!.inside.map(z => z.id)).toContain('in');
    expect(status!.inside.map(z => z.id)).not.toContain('out');
    expect(status!.outside.map(z => z.id)).toContain('out');
    expect(status!.totalActive).toBe(2);
  });

  it('returns outside status when location unavailable', () => {
    mockSafeZones = [{ id: 'z1', name: 'Zone', latitude: 0, longitude: 0, radius: 100, isActive: true, createdAt: Date.now(), notifications: { onEntry: true, onExit: true } }];
    // Simulate location error
    updateLocation(0, 0, 'Permission denied');
    const monitor = renderMonitor();
    act(() => { monitor.startMonitoring(); monitor.forceRefresh(); });
    const status = monitor.getCurrentSafeZoneStatus();
    expect(status).not.toBeNull();
    expect(status!.inside.length).toBe(0);
    expect(status!.outside.length).toBe(1);
  });

  it('caps event history at 20 entries (entry/exit cycles)', () => {
    mockSafeZones = [{
      id: 'z1', name: 'ZoneCap', latitude: 0, longitude: 0, radius: 120, isActive: true, createdAt: Date.now(),
      notifications: { onEntry: true, onExit: true },
    }];
    updateLocation(0, 0); // inside initially
    renderMonitor();
    // First refresh establishes entry
    act(() => { latestMonitor!.forceRefresh(); });
    // Generate many exit/entry pairs (> 10 pairs => >20 events)
    for (let i = 0; i < 15; i++) {
      // exit
      updateLocation(0.003 + i * 0.0001, 0.003 + i * 0.0001);
      act(() => { latestMonitor!.forceRefresh(); });
      // entry
      updateLocation(0, 0);
      act(() => { latestMonitor!.forceRefresh(); });
    }
    expect(latestMonitor!.events.length).toBe(20);
    // Ensure newest event is the last action (entry) we performed
    const newest = latestMonitor!.events[0];
    expect(newest.type).toBe('entry');
  });

  it('ignores inactive zones (no events generated)', () => {
    mockSafeZones = [{
      id: 'z_inactive', name: 'Inactive', latitude: 0, longitude: 0, radius: 200, isActive: false, createdAt: Date.now(),
      notifications: { onEntry: true, onExit: true },
    }];
    updateLocation(0, 0); // would be inside if active
    renderMonitor();
    act(() => { latestMonitor!.forceRefresh(); });
    expect(latestMonitor!.events.length).toBe(0);
    const status = latestMonitor!.getCurrentSafeZoneStatus();
    expect(status?.inside.length).toBe(0);
    expect(status?.totalActive).toBe(0);
  });
});

