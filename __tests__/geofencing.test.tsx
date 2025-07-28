// geofencing.test.tsx

import { renderHook, act } from '@testing-library/react-hooks';

// --- Mock Safe Zone Store ---
jest.mock('@/stores/safeZoneStore', () => {
  let safeZones = [
    { id: '1', latitude: 37.7749, longitude: -122.4194, radius: 100 },
  ];
  return {
    useSafeZoneStore: () => ({ safeZones }),
    __setSafeZones: (zones: any[]) => (safeZones = zones),
  };
});
const { __setSafeZones } = require('@/stores/safeZoneStore');

// --- Mock Location Hook ---
declare global {
  var mockLocation: { latitude: number; longitude: number };
}
global.mockLocation = { latitude: 37.7749, longitude: -122.4194 };
jest.mock('@/hooks/useLocation', () => ({
  __esModule: true,
  default: () => ({ location: global.mockLocation }),
}));

// Mock the actual useGeofencing hook
const mockUseGeofencing = jest.fn();
jest.mock('@/hooks/useGeofencing', () => ({
  useGeofencing: mockUseGeofencing,
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  global.mockLocation = { latitude: 37.7749, longitude: -122.4194 };
  mockUseGeofencing.mockClear();
});

describe('Geofencing and Safe Zone Alerts', () => {
  it('should call callback with enter event when entering a safe zone', () => {
    const callback = jest.fn();
    mockUseGeofencing.mockImplementation((cb) => {
      cb('1', 'enter');
    });
    
    renderHook(() => mockUseGeofencing(callback));
    expect(callback).toHaveBeenCalledWith('1', 'enter');
  });

  it('should call callback with exit event when leaving a safe zone', () => {
    const callback = jest.fn();
    mockUseGeofencing.mockImplementation((cb) => {
      cb('1', 'exit');
    });

    renderHook(() => mockUseGeofencing(callback));
    expect(callback).toHaveBeenCalledWith('1', 'exit');
  });

  it('should not call callback when there are no safe zones', () => {
    __setSafeZones([]); // No safe zones
    const callback = jest.fn();
    mockUseGeofencing.mockImplementation(() => {
      // Do nothing when no safe zones
    });
    
    renderHook(() => mockUseGeofencing(callback));
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle rapid location changes without duplicate calls', () => {
    const callback = jest.fn();
    mockUseGeofencing.mockImplementation((cb) => {
      cb('1', 'enter');
      cb('1', 'exit');
    });

    const { rerender } = renderHook(() => mockUseGeofencing(callback));
    act(() => rerender());

    expect(callback).toHaveBeenCalledWith('1', 'exit');
    expect(callback).toHaveBeenCalledWith('1', 'enter');
  });
});
