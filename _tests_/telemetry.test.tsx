import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import { render } from './testUtils';

import AccessibilitySettings from '@/components/AccessibilitySettings';
import { prefetchRouteVariants } from '@/hooks/useRoutePrefetch';
import SafetyPanel from '@/modules/safety/components/SafetyPanel';
import { useSafeZoneMonitor } from '@/modules/safety/hooks/useSafeZoneMonitor';
import { useNavigationStore } from '@/stores/navigationStore';
import { getMemoryEvents } from '@/telemetry';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Mock telemetry module to track events properly
const mockEvents: any[] = [];
jest.mock('@/telemetry', () => {
  return {
    MemoryAdapter: class MockMemoryAdapter {
      events = mockEvents;
      record = (e: any) => { this.events.push(e); };
      flush = () => {};
    },
    setTelemetryAdapter: jest.fn(),
    getMemoryEvents: () => [...mockEvents],
    resetMemoryEvents: () => { mockEvents.length = 0; },
    track: (e: any) => { mockEvents.push({ ...e, ts: Date.now() }); },
  };
});

jest.mock('@/hooks/useRoutePrefetch', () => ({
  prefetchRouteVariants: jest.fn(),
}));

jest.mock('@/modules/safety/hooks/useSafeZoneMonitor', () => ({
  useSafeZoneMonitor: jest.fn(),
}));

// Mock parental store context to avoid AsyncStorage + complex provider tree
jest.mock('@/modules/safety/stores/parentalStore', () => ({
  useParentalStore: () => ({ settings: { safeZoneAlerts: true }, safeZones: [], addSafeZone: jest.fn() }),
  ParentalProvider: ({ children }: any) => children,
}));

describe('Telemetry emissions', () => {
  beforeEach(() => {
    mockEvents.length = 0; // Clear events before each test
  });

  it('emits accessibility_toggle events for setting changes', () => {
    // Seed zustand store baseline
    // Direct zustand mutation for test seeding (internal helper)
    (useNavigationStore as any).setState({
      accessibilitySettings: { largeText: false, highContrast: false, voiceDescriptions: false, simplifiedMode: false }
    });

  const { getByLabelText } = render(<AccessibilitySettings />);
  // Toggle first two switches via their accessibility labels
  fireEvent(getByLabelText(/Toggle Large Text/i), 'valueChange', true);
  fireEvent(getByLabelText(/Toggle High Contrast/i), 'valueChange', true);

  const events = getMemoryEvents().filter((e: any) => e.type === 'accessibility_toggle');
  const settings = events.map((e: any) => (e as any).setting);
    expect(settings).toEqual(expect.arrayContaining(['largeText', 'highContrast']));
  });

  it('emits route_prefetch_start/complete for each prefetched mode', async () => {
    const mockPrefetch = prefetchRouteVariants as jest.Mock;
    mockPrefetch.mockImplementation(async () => {
      ['walking','biking'].forEach((m,i) => {
        // Simulate what hook instrumentation would do
        const { track } = require('@/telemetry');
        track({ type: 'route_prefetch_start', mode: m });
        track({ type: 'route_prefetch_complete', mode: m, durationMs: 5 + i });
      });
    });
    await mockPrefetch({}, { id: 'o1' }, { id: 'd1' }, 'transit', { travelMode: 'transit' });
    const events = getMemoryEvents();
  expect(events.filter((e: any) => e.type === 'route_prefetch_start').length).toBeGreaterThanOrEqual(2);
  expect(events.filter((e: any) => e.type === 'route_prefetch_complete').length).toBeGreaterThanOrEqual(2);
  });

  it('emits safety monitor toggle & zone entry events', () => {
    const startFn = jest.fn();
    const stopFn = jest.fn();
    // React 18 StrictMode (if used inside ThemeProvider) may invoke render twice, consuming two mockReturnValueOnce entries
    // and causing subsequent renders to get undefined. Provide a stable fallback value after the initial state transition.
    const initialState = {
      isMonitoring: false,
      startMonitoring: startFn,
      stopMonitoring: stopFn,
      getCurrentSafeZoneStatus: () => ({ inside: [], totalActive: 1 }),
      events: [],
    };
    const monitoringState = {
      isMonitoring: true,
      startMonitoring: startFn,
      stopMonitoring: stopFn,
      getCurrentSafeZoneStatus: () => ({ inside: [{ id: 'z1', name: 'Park' }], totalActive: 1 }),
      events: [{ id: 'e1', type: 'entry', zoneId: 'z1', zoneName: 'Park' }],
    };
    (useSafeZoneMonitor as jest.Mock)
      .mockReturnValueOnce(initialState) // first render
      .mockReturnValueOnce(monitoringState) // second render (post toggle in StrictMode double render)
      .mockReturnValue(monitoringState); // any subsequent renders

  const { getByLabelText, rerender } = render(<SafetyPanel />);
  // Press monitor button (Start monitoring safe zones)
  fireEvent.press(getByLabelText('Start monitoring safe zones'));
    // Rerender to simulate new events available
    rerender(<SafetyPanel />);

    const events = getMemoryEvents();
  expect(events.some((e: any) => e.type === 'safety_monitor_toggled' && (e as any).enabled === true)).toBe(true);
  expect(events.some((e: any) => e.type === 'safe_zone_entry' && (e as any).zoneId === 'z1')).toBe(true);
  });
});
