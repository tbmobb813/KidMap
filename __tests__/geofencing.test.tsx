// geofencing.test.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useGeofencing } from '@/hooks/useGeofencing';

// --- Mock Safe Zone Store ---
let safeZonesMock = [
  { id: '1', latitude: 37.7749, longitude: -122.4194, radius: 100 },
];
jest.mock('@/stores/safeZoneStore', () => ({
  useSafeZoneStore: () => ({ safeZones: safeZonesMock }),
}));

// --- Mock Location Hook ---
declare global {
  // eslint-disable-next-line no-var
  var mockLocation: { latitude: number; longitude: number };
}
global.mockLocation = { latitude: 37.7749, longitude: -122.4194 };
jest.mock('@/hooks/useLocation', () => ({
  __esModule: true,
  default: () => ({ location: global.mockLocation }),
}));

// --- Reset State After Each Test ---
afterEach(() => {
  jest.clearAllMocks();
  safeZonesMock = [
    { id: '1', latitude: 37.7749, longitude: -122.4194, radius: 100 },
  ];
  global.mockLocation = { latitude: 37.7749, longitude: -122.4194 };
});

describe('Geofencing and Safe Zone Alerts', () => {
  it('should call callback with enter event when entering a safe zone', () => {
    const callback = jest.fn();
    renderHook(() => useGeofencing(callback));

    expect(callback).toHaveBeenCalledWith('1', 'enter');
  });

  it('should call callback with exit event when leaving a safe zone', () => {
    const callback = jest.fn();

    // Start inside the zone
    global.mockLocation = { latitude: 37.7749, longitude: -122.4194 };
    const { rerender } = renderHook(() => useGeofencing(callback));
    expect(callback).toHaveBeenCalledWith('1', 'enter');

    // Move outside the zone
    global.mockLocation = { latitude: 37.7849, longitude: -122.4294 };
    act(() => {
      rerender();
    });

    expect(callback).toHaveBeenCalledWith('1', 'exit');
  });

  it('should not call callback when there are no safe zones', () => {
    safeZonesMock = []; // No zones
    const callback = jest.fn();

    renderHook(() => useGeofencing(callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle rapid location changes without duplicate calls', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(() => useGeofencing(callback));

    // Simulate location toggling
    global.mockLocation = { latitude: 37.7849, longitude: -122.4294 }; // exit
    act(() => rerender());
    global.mockLocation = { latitude: 37.7749, longitude: -122.4194 }; // enter
    act(() => rerender());

    expect(callback).toHaveBeenCalledWith('1', 'exit');
    expect(callback).toHaveBeenCalledWith('1', 'enter');
  });
});
